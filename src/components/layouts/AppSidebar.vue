<template>
  <TooltipProvider :delay-duration="0">
    <Sidebar
      collapsible="icon"
      class="bg-sidebar select-none"
      style="
        --sidebar-width: 224px;
        --sidebar-width-icon: 50px;
        border-right: none;
        box-shadow: 1px 0 0 rgb(var(--color-border) / 0.25);
      "
    >
      <!-- ══════════════════════════════
           WORKSPACE SWITCHER
      ══════════════════════════════ -->
      <SidebarHeader
        class="p-0 shrink-0"
        style="border-bottom: 1px solid rgb(var(--color-border) / 0.35)"
      >
        <SidebarMenu>
          <SidebarMenuItem class="p-2">
            <Popover v-model:open="wsOpen">
              <PopoverTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  :aria-expanded="wsOpen"
                  class="h-auto rounded-xl px-2 py-1.5 hover:bg-accent transition-colors"
                  :class="
                    isSidebarCollapsed ? 'justify-center px-0' : 'gap-2.5'
                  "
                >
                  <Avatar class="h-7 w-7 rounded-lg shrink-0">
                    <AvatarImage
                      v-if="workspaceStore.activeWorkspace?.logo"
                      :src="workspaceStore.activeWorkspace.logo"
                    />
                    <AvatarFallback
                      class="rounded-lg text-[11px] font-black text-white"
                      :style="{ backgroundColor: wsAvatarColor }"
                    >
                      {{ wsInitial }}
                    </AvatarFallback>
                  </Avatar>
                  <template v-if="!isSidebarCollapsed">
                    <div class="flex-1 min-w-0 text-left">
                      <p
                        class="text-[12.5px] font-semibold text-foreground truncate leading-tight"
                      >
                        {{
                          workspaceStore.activeWorkspace?.name ?? "Workspace"
                        }}
                      </p>
                      <p
                        class="text-[9.5px] text-muted-foreground leading-tight mt-0.5 font-medium"
                      >
                        Active workspace
                      </p>
                    </div>
                    <ChevronsUpDown
                      class="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                    />
                  </template>
                </SidebarMenuButton>
              </PopoverTrigger>

              <PopoverContent
                class="p-2 min-h-60 min-w-2xs border border-border rounded-sm bg-popover overflow-hidden"
                style="
                  width: 252px;
                  box-shadow:
                    0 20px 60px -10px rgba(0, 0, 0, 0.25),
                    0 0 0 1px rgba(0, 0, 0, 0.04);
                "
                :side="isSidebarCollapsed ? 'right' : 'bottom'"
                align="start"
                :side-offset="isSidebarCollapsed ? 8 : 4"
              >
                <Command>
                  <div class="flex items-center gap-2 px-3 py-2.5">
                    <CommandInput
                      placeholder="Find workspace…"
                      class="h-auto p-2 text-[12px] shadow-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <CommandList class="max-h-52 overflow-y-auto py-1.5 px-1.5">
                    <CommandEmpty
                      class="py-8 text-center text-[12px] text-muted-foreground"
                    >
                      No workspaces found
                    </CommandEmpty>
                    <CommandGroup>
                      <div
                        v-if="workspacesLoading"
                        disabled
                        class="flex items-center gap-2 px-2.5 py-2 text-[12px] text-muted-foreground"
                      >
                        <Loader2 class="h-3.5 w-3.5 animate-spin shrink-0" />
                        Loading…
                      </div>
                      <CommandItem
                        v-for="ws in workspaceStore.workspaces"
                        v-else
                        :key="ws.id"
                        :value="ws.name"
                        class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer"
                        :class="
                          workspaceStore.activeWorkspace?.id === ws.id
                            ? 'bg-accent'
                            : ''
                        "
                        @select="selectWorkspace(ws)"
                      >
                        <Avatar class="h-6 w-6 rounded-lg shrink-0">
                          <AvatarFallback
                            class="rounded-lg text-[9px] font-black text-white"
                            :style="{ backgroundColor: getWsColor(ws.name) }"
                          >
                            {{ ws.name.charAt(0).toUpperCase() }}
                          </AvatarFallback>
                        </Avatar>
                        <span class="flex-1 truncate text-[12.5px] font-medium">
                          {{ ws.name }}
                        </span>
                        <div
                          v-if="workspaceStore.activeWorkspace?.id === ws.id"
                          class="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                        />
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                  <div class="mt-4 w-full">
                    <div
                      class="flex items-center justify-between w-full pt-4 bg-muted/30 border-t border-border/35"
                    >
                      <Button
                        variant="header"
                        size="sm"
                        shape="square"
                        class="text-[10px] rounded-xs"
                        @click="
                          wsOpen = false;
                          router.push({ name: 'workspace-add' });
                        "
                      >
                        Add workspace
                      </Button>

                      <Button
                        variant="header"
                        size="sm"
                        shape="square"
                        class="text-[10px] rounded-xs"
                        @click="
                          wsOpen = false;
                          router.push({ name: 'workspace' });
                        "
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Command>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <!-- ══════════════════════════════
           SIDEBAR CONTENT
      ══════════════════════════════ -->
      <SidebarContent class="gap-0 overflow-x-hidden">
        <!-- Primary nav -->
        <SidebarGroup class="px-2 pt-2 pb-1 shrink-0">
          <SidebarMenu class="gap-px">
            <SidebarMenuItem v-for="item in primaryNav" :key="item.entity">
              <template v-if="isSidebarCollapsed">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      class="h-9 rounded-xl transition-colors cursor-pointer justify-center px-0"
                      @click="handleNav(item.entity)"
                    >
                      <component :is="item.icon" />
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="text-xs font-medium">
                    {{ item.label }}
                    <span v-if="item.badge" class="ml-1 opacity-60">
                      ({{ item.badge }})
                    </span>
                  </TooltipContent>
                </Tooltip>
              </template>

              <template v-else>
                <SidebarMenuButton
                  class="h-9 rounded-xl transition-colors cursor-pointer gap-2.5 px-3"
                  @click="handleNav(item.entity)"
                >
                  <component :is="item.icon" />
                  <span class="flex-1 text-[12.5px] font-medium">
                    {{ item.label }}
                  </span>
                  <Badge
                    v-if="item.badge"
                    variant="outline"
                    class="rounded-full px-2 py-0 h-5 text-[10px] font-bold border-0 normal-case tracking-normal font-sans"
                    :class="
                      item.badgeMuted
                        ? 'bg-violet-200 text-primary'
                        : 'bg-violet-100 text-violet-600 dark:bg-violet-500 dark:text-white'
                    "
                  >
                    {{ item.badge > 99 ? "99+" : item.badge }}
                  </Badge>
                </SidebarMenuButton>
              </template>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <div class="mx-4 my-2 h-px border" />

        <!-- ══════════════════════════════
             PINNED BOARDS SECTION
        ══════════════════════════════ -->
        <template v-if="!isSidebarCollapsed && pinnedBoards.length > 0">
          <SidebarGroup class="px-2 pt-1 pb-1 shrink-0">
            <div class="flex items-center justify-between px-1 mb-1 shrink-0">
              <span
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5"
              >
                <Pin class="h-2.5 w-2.5" />
                Pinned
              </span>
            </div>
            <SidebarMenu class="gap-0">
              <SidebarMenuItem
                v-for="board in pinnedBoards"
                :key="`pin-${board.pipelineId}`"
              >
                <div
                  class="group/pinned flex items-center rounded-xl transition-colors cursor-pointer px-2 py-1.5 gap-2 hover:bg-accent"
                  :class="
                    isActivePipeline(board.pipelineId)
                      ? 'bg-primary/8 text-primary'
                      : 'text-muted-foreground'
                  "
                  @click="navigateToPipeline(board)"
                >
                  <div
                    class="h-5 w-5 rounded-md flex items-center justify-center shrink-0"
                    :style="{
                      backgroundColor:
                        getProjectColor(board.projectName) + '22',
                    }"
                  >
                    <Columns3
                      class="h-3 w-3 shrink-0"
                      :style="{ color: getProjectColor(board.projectName) }"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-[12px] font-medium text-foreground truncate leading-tight"
                    >
                      {{ board.pipelineName }}
                    </p>
                    <p
                      class="text-[9.5px] text-muted-foreground truncate leading-none mt-0.5"
                    >
                      {{ board.projectName }}
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button
                        type="button"
                        class="h-5 w-5 rounded-md flex items-center justify-center opacity-0 group-hover/pinned:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                        @click.stop="unpinBoard(board.pipelineId)"
                      >
                        <PinOff class="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" class="text-xs">
                      Unpin
                    </TooltipContent>
                  </Tooltip>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <div class="mx-4 my-1 h-px border" />
        </template>

        <!-- Collapsed pinned section — icon-only -->
        <template v-if="isSidebarCollapsed && pinnedBoards.length > 0">
          <SidebarGroup
            class="flex flex-col items-center gap-1 px-2 pt-2 pb-1 shrink-0"
          >
            <Tooltip
              v-for="board in pinnedBoards"
              :key="`cpin-${board.pipelineId}`"
            >
              <TooltipTrigger as-child>
                <button
                  type="button"
                  class="group/cpin relative h-8 w-8 rounded-xl flex items-center justify-center transition-colors hover:bg-accent"
                  :class="
                    isActivePipeline(board.pipelineId)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  "
                  @click="navigateToPipeline(board)"
                >
                  <span
                    class="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
                    :style="{
                      backgroundColor: getProjectColor(board.projectName),
                    }"
                  />
                  <Columns3 class="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" class="text-xs font-medium">
                <span class="font-semibold">{{ board.pipelineName }}</span>
                <span class="opacity-60 ml-1">· {{ board.projectName }}</span>
              </TooltipContent>
            </Tooltip>
          </SidebarGroup>
          <div class="mx-3 my-1 h-px border" />
        </template>

        <!-- Projects section — collapsed: show just the two action buttons -->
        <SidebarGroup
          v-if="isSidebarCollapsed"
          class="flex flex-col items-center gap-4 pl-2.5 pt-3 pb-1 shrink-0"
        >
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="header"
                shape="circle"
                class="cursor-pointer flex items-center justify-center w-7.5 h-7.5 rounded-[99999px] transition-all duration-200 text-primary hover:bg-violet-200 text-violet-500"
                @click="addProject"
              >
                <Plus class="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" class="text-xs font-medium">
              New project
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="header"
                shape="circle"
                class="cursor-pointer flex items-center justify-center w-7.5 h-7.5 rounded-[99999px] transition-all duration-200 text-primary hover:bg-violet-200 text-violet-500"
                @click="viewProject"
              >
                <FolderSearch class="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" class="text-xs font-medium">
              View projects
            </TooltipContent>
          </Tooltip>
        </SidebarGroup>

        <!-- Projects section -->
        <SidebarGroup
          v-if="!isSidebarCollapsed"
          class="flex-1 min-h-0 overflow-hidden flex flex-col px-2 pt-1.5 pb-2"
        >
          <div class="flex items-center justify-between px-1 mb-1.5 shrink-0">
            <span
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50"
            >
              Projects
            </span>

            <div class="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="header"
                    shape="circle"
                    class="relative cursor-pointer flex items-center justify-center p-2 w-7 h-7 rounded-[9999px] transition-all duration-200 text-primary hover:bg-violet-200 text-violet-500"
                    @click="addProject"
                  >
                    <Plus class="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" class="text-xs font-medium">
                  New project
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="header"
                    shape="circle"
                    class="relative cursor-pointer flex items-center p-2 justify-center w-7 h-7 rounded-[9999px] transition-all duration-200 text-primary hover:bg-violet-200 text-violet-500"
                    @click="
                      router.push({
                        name: 'project-index',
                        params: {
                          workspaceId: workspaceStore.activeWorkspace?.id,
                        },
                      })
                    "
                  >
                    <FolderSearch class="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" class="text-xs font-medium">
                  View projects
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <SidebarGroupContent
            class="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border/0 hover:scrollbar-thumb-border scrollbar-track-transparent"
            style="scrollbar-width: thin"
          >
            <SidebarMenu class="gap-0">
              <!-- Loading skeletons -->
              <template v-if="projectsLoading">
                <SidebarMenuItem v-for="i in 4" :key="`sk-${i}`">
                  <SidebarMenuSkeleton :show-icon="true" />
                </SidebarMenuItem>
              </template>

              <!-- Empty state -->
              <SidebarMenuItem
                v-else-if="
                  projectStore.projects.length === 0 && !isSidebarCollapsed
                "
              >
                <div
                  class="flex flex-col items-center gap-2.5 py-10 px-2 text-center"
                >
                  <FolderOpen class="h-8 w-8 text-muted-foreground/25" />
                  <p class="text-[11px] text-muted-foreground">
                    No projects yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-7 text-[11px] rounded-lg"
                    @click="addProject"
                  >
                    <Plus class="h-3 w-3 mr-1" /> Create project
                  </Button>
                </div>
              </SidebarMenuItem>

              <template v-else>
                <SidebarMenuItem
                  v-for="project in projectStore.projects"
                  :key="project.id"
                >
                  <Collapsible
                    :open="expandedProjects.has(project.id)"
                    @update:open="(v) => onProjectOpenChange(project, v)"
                  >
                    <div
                      class="group/proj flex items-center rounded-xl transition-colors"
                      :class="
                        isActiveProject(project.id)
                          ? 'bg-primary/8'
                          : 'hover:bg-accent'
                      "
                    >
                      <CollapsibleTrigger as-child>
                        <button
                          type="button"
                          class="flex h-8 w-5.5 shrink-0 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
                          @click.stop
                        >
                          <ChevronRight
                            class="h-3 w-3 transition-transform duration-200"
                            :class="
                              expandedProjects.has(project.id)
                                ? 'rotate-90 text-foreground/60'
                                : ''
                            "
                          />
                        </button>
                      </CollapsibleTrigger>

                      <!-- Folder icon + name -->
                      <button
                        type="button"
                        class="flex flex-1 items-center gap-2 py-1.5 min-w-0 text-left"
                        @click="navigateToProject(project)"
                      >
                        <FolderOpen
                          v-if="expandedProjects.has(project.id)"
                          class="h-3.75 w-3.75 shrink-0 transition-colors"
                        />
                        <Folder
                          v-else
                          class="h-3.75 w-3.75 shrink-0 text-muted-foreground/50 transition-colors"
                        />
                        <span
                          class="flex-1 truncate text-[12.5px] font-medium text-foreground"
                        >
                          {{ project.name }}
                        </span>
                      </button>

                      <!-- ··· context — Popover -->
                      <Popover
                        :open="ctxOpenId === project.id"
                        @update:open="
                          (v) => {
                            ctxOpenId = v ? project.id : null;
                          }
                        "
                      >
                        <PopoverTrigger as-child>
                          <Button
                            variant="ghost"
                            size="icon"
                            class="h-5.5 w-5.5 rounded-md mr-0.5 opacity-0 group-hover/proj:opacity-100 text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-all shrink-0"
                            @click.stop
                          >
                            <MoreHorizontal class="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          class="p-0 w-60 rounded-2xl border border-border/60 bg-popover overflow-hidden shadow-2xl backdrop-blur-xl"
                          side="right"
                          align="start"
                          :side-offset="8"
                        >
                          <!-- Header -->
                          <div
                            class="px-3 py-2.5 border-b border-border/40 bg-gradient-to-b from-muted/40 to-transparent"
                          >
                            <div class="flex items-center gap-2">
                              <div
                                class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary"
                              >
                                {{ project.name.charAt(0) }}
                              </div>
                              <p
                                class="text-[13px] font-semibold text-foreground truncate"
                              >
                                {{ project.name }}
                              </p>
                            </div>
                          </div>

                          <!-- Menu -->
                          <div class="p-1.5">
                            <p
                              class="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
                            >
                              Actions
                            </p>

                            <div class="space-y-0.5">
                              <button
                                type="button"
                                class="group flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium hover:bg-accent transition"
                                @click="ctxDetail(project)"
                              >
                                <Eye
                                  class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0"
                                />
                                <span class="flex-1 text-left">
                                  View details
                                </span>
                                <span
                                  class="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition"
                                >
                                  ↵
                                </span>
                              </button>

                              <button
                                type="button"
                                class="group flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium hover:bg-accent transition"
                                @click="ctxEdit(project)"
                              >
                                <Pencil
                                  class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0"
                                />
                                <span class="flex-1 text-left">
                                  Edit project
                                </span>
                                <span
                                  class="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition"
                                >
                                  E
                                </span>
                              </button>
                            </div>

                            <p
                              class="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
                            >
                              Boards
                            </p>

                            <div class="space-y-0.5">
                              <button
                                type="button"
                                class="group flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium hover:bg-accent transition"
                                @click="ctxAddPipeline(project)"
                              >
                                <Columns3
                                  class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0"
                                />
                                <span class="flex-1 text-left">Add board</span>
                              </button>

                              <button
                                type="button"
                                class="group flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium hover:bg-accent transition"
                                @click="ctxViewPipelines(project)"
                              >
                                <ViewIcon
                                  class="h-4 w-4 text-muted-foreground group-hover:text-foreground transition shrink-0"
                                />
                                <span class="flex-1 text-left">
                                  View boards
                                </span>
                                <span
                                  class="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition"
                                >
                                  ⌘B
                                </span>
                              </button>
                            </div>

                            <div
                              class="my-2 h-px bg-linear-to-r from-transparent via-border/40 to-transparent"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <!-- ── Pipelines (flat list, no stages) ── -->
                    <CollapsibleContent>
                      <div
                        v-if="pipelinesLoading.has(project.id)"
                        class="ml-5 mr-2 mt-0.5 h-4 rounded-lg bg-muted/60 animate-pulse"
                      />

                      <template v-else>
                        <div
                          v-if="
                            (projectPipelines.get(project.id) ?? []).length ===
                            0
                          "
                          class="flex items-center gap-1.5 ml-5 px-2 py-1 rounded-lg text-[10.5px] font-medium text-muted-foreground/40 hover:text-primary hover:bg-accent transition-colors cursor-pointer"
                          @click.stop="
                            router.push({
                              name: 'pipeline-add',
                              params: { projectId: project.id },
                            })
                          "
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="cursor-pointer h-7"
                          >
                            Add board
                          </Button>
                        </div>

                        <template v-else>
                          <div
                            v-for="pipeline in projectPipelines.get(project.id)"
                            :key="pipeline.id"
                            class="group/board flex items-center ml-5 rounded-lg transition-colors cursor-pointer"
                            :class="
                              isActivePipeline(pipeline.id)
                                ? 'bg-primary/7 text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            "
                            @click="
                              router.push({
                                name: 'pipeline-index',
                                params: { projectId: project.id },
                              })
                            "
                          >
                            <button
                              type="button"
                              class="flex flex-1 items-center gap-1.5 h-7 px-2 min-w-0 text-left"
                            >
                              <Columns3 class="h-3 w-3 shrink-0 opacity-60" />
                              <span
                                class="truncate text-[12px] font-medium text-foreground/80"
                              >
                                {{ pipeline.name }}
                              </span>
                            </button>

                            <!-- Pin / Unpin button -->
                            <Tooltip>
                              <TooltipTrigger as-child>
                                <button
                                  type="button"
                                  class="h-5 w-5 mr-1.5 rounded-md flex items-center justify-center transition-all shrink-0"
                                  :class="
                                    isPinned(pipeline.id)
                                      ? 'text-primary opacity-100'
                                      : 'opacity-0 group-hover/board:opacity-100 text-muted-foreground/50 hover:text-primary'
                                  "
                                  @click.stop="togglePin(pipeline, project)"
                                >
                                  <Pin
                                    v-if="!isPinned(pipeline.id)"
                                    class="h-3 w-3"
                                  />
                                  <PinOff v-else class="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" class="text-xs">
                                {{
                                  isPinned(pipeline.id)
                                    ? "Unpin board"
                                    : "Pin board"
                                }}
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div
                            class="flex items-center gap-1.5 ml-5 px-2 py-1 rounded-lg text-[10.5px] font-medium text-muted-foreground/40 hover:text-primary hover:bg-accent transition-colors cursor-pointer"
                            @click.stop="
                              router.push({
                                name: 'pipeline-add',
                                params: { projectId: project.id },
                              })
                            "
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              class="cursor-pointer h-7"
                            >
                              Add board
                            </Button>
                          </div>
                        </template>
                      </template>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>

                <!-- Add project -->
                <SidebarMenuItem
                  class="flex justify-between items-center mt-10"
                >
                  <template v-if="!isSidebarCollapsed" />

                  <template v-else>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          variant="header"
                          size="xs"
                          shape="circle"
                          class="h-8 w-8 p-0 bg-transparent text-muted-foreground border border-border/50 hover:bg-accent hover:text-foreground hover:border-border active:scale-95 transition-all duration-150"
                          @click="addProject"
                        >
                          <Plus class="h-3.5 w-3.5 shrink-0" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" class="text-xs font-medium">
                        Add project
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          variant="header"
                          size="xs"
                          shape="circle"
                          class="h-8 w-8 p-0 bg-transparent text-muted-foreground border border-border/50 hover:bg-accent hover:text-foreground hover:border-border active:scale-95 transition-all duration-150"
                          @click="viewProject"
                        >
                          <FolderSearch class="h-3.5 w-3.5 shrink-0" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" class="text-xs font-medium">
                        View all projects
                      </TooltipContent>
                    </Tooltip>
                  </template>
                </SidebarMenuItem>
              </template>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <!-- ══════════════════════════════
           FOOTER
      ══════════════════════════════ -->
      <SidebarFooter class="p-0">
        <div class="px-2 pt-1 pb-0">
          <Tooltip>
            <TooltipTrigger as-child>
              <SidebarMenuButton
                class="h-9 rounded-xl transition-colors cursor-pointer"
                :class="
                  isSidebarCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
                "
                @click="
                  router.push({
                    name: 'workspace-edit',
                    params: { id: workspaceStore.activeWorkspace?.id },
                  })
                "
              >
                <Settings class="h-4 w-4 shrink-0" />
                <span
                  v-if="!isSidebarCollapsed"
                  class="text-[12.5px] font-medium"
                >
                  Settings
                </span>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent
              v-if="isSidebarCollapsed"
              side="right"
              class="text-xs"
            >
              Settings
            </TooltipContent>
          </Tooltip>
        </div>

        <!-- User popover -->
        <Popover v-model:open="userMenuOpen">
          <PopoverTrigger as-child>
            <button
              type="button"
              class="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-accent transition-colors"
              :class="isSidebarCollapsed ? 'justify-center' : ''"
              style="border-top: 1px solid rgb(var(--color-border) / 0.25)"
            >
              <Avatar class="h-7 w-7 shrink-0">
                <AvatarImage
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                />
                <AvatarFallback
                  class="text-[10px] font-bold bg-primary text-primary-foreground"
                >
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>
              <template v-if="!isSidebarCollapsed">
                <div class="flex-1 min-w-0 text-left">
                  <p
                    class="text-[12px] font-semibold text-foreground truncate leading-tight"
                  >
                    {{ authStore.user?.name ?? "User" }}
                  </p>
                  <p
                    class="text-[9.5px] text-muted-foreground truncate leading-tight"
                  >
                    {{ authStore.user?.email ?? "" }}
                  </p>
                </div>
                <ChevronsUpDown
                  class="h-3 w-3 shrink-0 text-muted-foreground/40"
                />
              </template>
            </button>
          </PopoverTrigger>
          <PopoverContent
            class="p-0 w-56 rounded-2xl border border-border/60 bg-popover overflow-hidden"
            :side="isSidebarCollapsed ? 'right' : 'top'"
            align="start"
            :side-offset="4"
            style="box-shadow: 0 12px 40px -8px rgba(0, 0, 0, 0.2)"
          >
            <div
              class="flex items-center gap-2.5 px-3 py-3"
              style="border-bottom: 1px solid rgb(var(--color-border) / 0.35)"
            >
              <Avatar class="h-8 w-8 shrink-0">
                <AvatarImage
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                />
                <AvatarFallback
                  class="text-[10px] font-bold bg-primary text-primary-foreground"
                >
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p class="text-[13px] font-semibold text-foreground truncate">
                  {{ authStore.user?.name }}
                </p>
                <p class="text-[10.5px] text-muted-foreground truncate">
                  {{ authStore.user?.email }}
                </p>
              </div>
            </div>
            <div class="p-1">
              <button
                type="button"
                class="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium text-foreground hover:bg-accent transition-colors text-left"
                @click="userMenuOpen = false"
              >
                <UserCircle
                  class="h-3.5 w-3.5 text-muted-foreground shrink-0"
                />
                Profile
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium text-foreground hover:bg-accent transition-colors text-left"
                @click="
                  userMenuOpen = false;
                  router.push({ name: 'workspace' });
                "
              >
                <Building2 class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                Workspaces
              </button>
              <Separator class="my-1 bg-border/40" />
              <button
                type="button"
                class="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium text-destructive hover:bg-accent transition-colors text-left"
                @click="handleLogout"
              >
                <LogOut class="h-3.5 w-3.5 shrink-0" /> Sign out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>

    <!-- ── Task secondary sidebar ───────────────────────────────────────────── -->
    <TaskSidebar
      :open="taskSidebarOpen"
      :main-collapsed="isSidebarCollapsed"
      @close="taskSidebarOpen = false"
    />
  </TooltipProvider>
</template>

<script setup lang="ts">
  import {
    Building2,
    ChartArea,
    ChevronRight,
    ChevronsUpDown,
    ClipboardList,
    Columns3,
    Eye,
    Folder,
    FolderOpen,
    FolderSearch,
    Image,
    LayoutPanelLeft,
    Loader2,
    LogOut,
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Pin,
    PinOff,
    Plus,
    Settings,
    UserCircle,
    ViewIcon,
  } from "lucide-vue-next";
  import { computed, onMounted, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible";
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
  import { Separator } from "@/components/ui/separator";
  import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarRail,
    useSidebar,
  } from "@/components/ui/sidebar";
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

  import { useAuthStore } from "@/stores/auth";
  import { usePipelineStore } from "@/stores/pipeline";
  import { useProjectStore, type Project } from "@/stores/project";
  import { useWorkspaceStore, type Workspace } from "@/stores/workspace";

  import TaskSidebar from "@/views/task/common/TaskSidebar.vue";

  // ── Types ─────────────────────────────────────────────────────────────────────
  interface PinnedBoard {
    pipelineId: number;
    pipelineName: string;
    projectId: number;
    projectName: string;
  }

  // ── Stores ────────────────────────────────────────────────────────────────────
  const router = useRouter();
  const route = useRoute();
  const workspaceStore = useWorkspaceStore();
  const projectStore = useProjectStore();
  const pipelineStore = usePipelineStore();
  const authStore = useAuthStore();

  const { state: sidebarState } = useSidebar();
  const isSidebarCollapsed = computed(() => sidebarState.value === "collapsed");

  // ── Task sidebar state ────────────────────────────────────────────────────────
  const taskSidebarOpen = ref(false);

  watch(
    () => route.name,
    (name) => {
      const taskRoutes = [
        "task-all",
        "my-tasks",
        "task-index",
        "task-detail",
        "task-edit",
        "task-add",
      ];
      if (!taskRoutes.includes(String(name))) {
        taskSidebarOpen.value = false;
      }
    },
  );

  // ── Pinned boards ─────────────────────────────────────────────────────────────
  const PINNED_STORAGE_KEY = computed(
    () => `pinned-boards-ws-${workspaceStore.activeWorkspace?.id ?? "global"}`,
  );

  function loadPinned(): PinnedBoard[] {
    try {
      const raw = localStorage.getItem(PINNED_STORAGE_KEY.value);
      return raw ? (JSON.parse(raw) as PinnedBoard[]) : [];
    } catch {
      return [];
    }
  }

  function savePinned(boards: PinnedBoard[]): void {
    try {
      localStorage.setItem(PINNED_STORAGE_KEY.value, JSON.stringify(boards));
    } catch {
      /**/
    }
  }

  const pinnedBoards = ref<PinnedBoard[]>(loadPinned());

  // Reload pinned when workspace changes
  watch(
    () => workspaceStore.activeWorkspace?.id,
    () => {
      pinnedBoards.value = loadPinned();
    },
  );

  function isPinned(pipelineId: number): boolean {
    return pinnedBoards.value.some((b) => b.pipelineId === pipelineId);
  }

  function togglePin(
    pipeline: { id: number; name: string },
    project: Project,
  ): void {
    if (isPinned(pipeline.id)) {
      unpinBoard(pipeline.id);
    } else {
      const next = [
        ...pinnedBoards.value,
        {
          pipelineId: pipeline.id,
          pipelineName: pipeline.name,
          projectId: project.id,
          projectName: project.name,
        },
      ];
      pinnedBoards.value = next;
      savePinned(next);
    }
  }

  function unpinBoard(pipelineId: number): void {
    const next = pinnedBoards.value.filter((b) => b.pipelineId !== pipelineId);
    pinnedBoards.value = next;
    savePinned(next);
  }

  function navigateToPipeline(board: PinnedBoard): void {
    router.push({
      name: "pipeline-index",
      params: { projectId: board.projectId },
    });
  }

  // ── Primary nav ───────────────────────────────────────────────────────────────
  const primaryNav = [
    {
      entity: "dashboard",
      label: "Dashboard",
      icon: LayoutPanelLeft,
      badge: null,
      badgeMuted: false,
    },
    {
      entity: "chat",
      label: "Chat",
      icon: MessageCircle,
      badge: 2,
      badgeMuted: true,
    },
    {
      entity: "task-index",
      label: "Tasks",
      icon: ClipboardList,
      badge: 152,
      badgeMuted: true,
    },
    {
      entity: "analytics",
      label: "Analytics",
      icon: ChartArea,
      badge: 3,
      badgeMuted: false,
    },
    {
      entity: "media",
      label: "Media",
      icon: Image,
      badge: null,
      badgeMuted: false,
    },
  ];

  function handleNav(entity: string): void {
    if (entity === "dashboard") {
      taskSidebarOpen.value = false;
      router.push({ name: "dashboard" });
      return;
    }
    if (entity === "task-index") {
      taskSidebarOpen.value = !taskSidebarOpen.value;
      return;
    }
    if (entity === "chat") {
      taskSidebarOpen.value = false;
      router.push({ name: "chat" });
      return;
    }
    if (entity === "analytics") {
      taskSidebarOpen.value = false;
      router.push({ name: "analytics" });
      return;
    }
    if (entity === "media") {
      taskSidebarOpen.value = false;
      router.push({ name: "media-index" });
      return;
    }
  }

  // ── Colors ────────────────────────────────────────────────────────────────────
  const WS_PALETTE = [
    "#7C3AED",
    "#2563EB",
    "#059669",
    "#D97706",
    "#DC2626",
    "#0891B2",
    "#DB2777",
    "#0F766E",
  ];
  const PROJ_PALETTE = [
    "#7c6cfa",
    "#34c77b",
    "#f5a623",
    "#4a9eff",
    "#f05252",
    "#9d7cfa",
    "#0891B2",
    "#DB2777",
  ];

  function hashColor(name: string, palette: string[]): string {
    let h = 0;
    for (let i = 0; i < name.length; i++)
      h = name.charCodeAt(i) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
  }
  const getWsColor = (n: string) => hashColor(n, WS_PALETTE);
  const getProjectColor = (n: string) => hashColor(n, PROJ_PALETTE);

  const wsInitial = computed(
    () => workspaceStore.activeWorkspace?.name?.charAt(0).toUpperCase() ?? "W",
  );
  const wsAvatarColor = computed(() =>
    workspaceStore.activeWorkspace
      ? getWsColor(workspaceStore.activeWorkspace.name)
      : "#7C3AED",
  );
  const userInitials = computed(() => {
    const name = authStore.user?.name ?? "";
    return (
      name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  });

  // ── Workspace switcher ────────────────────────────────────────────────────────
  const wsOpen = ref(false);
  const workspacesLoading = ref(false);

  async function selectWorkspace(ws: Workspace): Promise<void> {
    wsOpen.value = false;
    await workspaceStore.fetchWorkspace(ws.id);
    expandedProjects.value = new Set();
    projectPipelines.value = new Map();
    router.push({ name: "project-index", params: { workspaceId: ws.id } });
  }

  // ── User menu ─────────────────────────────────────────────────────────────────
  const userMenuOpen = ref(false);
  async function handleLogout(): Promise<void> {
    userMenuOpen.value = false;
    await authStore.logout();
    router.push({ name: "login" });
  }

  // ── Project tree state ────────────────────────────────────────────────────────
  const projectsLoading = ref(false);
  const expandedProjects = ref<Set<number>>(new Set());
  const pipelinesLoading = ref<Set<number>>(new Set());
  const projectPipelines = ref<Map<number, { id: number; name: string }[]>>(
    new Map(),
  );
  const ctxOpenId = ref<number | null>(null);

  async function loadProjects(): Promise<void> {
    if (!workspaceStore.activeWorkspace) return;
    projectsLoading.value = true;
    try {
      const res = await projectStore.fetchProjects({
        workspaceId: workspaceStore.activeWorkspace.id,
        page: 1,
        perPage: 10,
      });
      projectStore.projects = res.data ?? [];
    } catch {
      /**/
    } finally {
      projectsLoading.value = false;
    }
  }

  async function loadPipelinesForProject(projectId: number): Promise<void> {
    if (
      projectPipelines.value.has(projectId) ||
      pipelinesLoading.value.has(projectId)
    )
      return;
    pipelinesLoading.value = new Set([...pipelinesLoading.value, projectId]);
    try {
      const res = await pipelineStore.fetchPipelines({
        projectId,
        page: 1,
        perPage: 10,
        search: "",
        sortBy: "name",
        sortOrder: "asc",
        filters: [],
      });
      projectPipelines.value = new Map([
        ...projectPipelines.value,
        [
          projectId,
          (res.data ?? []).map((p: any) => ({
            id: p.id as number,
            name: p.name as string,
          })),
        ],
      ]);
    } catch {
      projectPipelines.value = new Map([
        ...projectPipelines.value,
        [projectId, []],
      ]);
    } finally {
      const next = new Set(pipelinesLoading.value);
      next.delete(projectId);
      pipelinesLoading.value = next;
    }
  }

  function onProjectOpenChange(project: Project, open: boolean): void {
    const next = new Set(expandedProjects.value);
    if (open) {
      next.add(project.id);
      loadPipelinesForProject(project.id);
    } else next.delete(project.id);
    expandedProjects.value = next;
  }

  // ── Active state helpers ──────────────────────────────────────────────────────
  function _id(param: string): number {
    const raw = route.params[param];
    return Number(Array.isArray(raw) ? raw[0] : raw);
  }
  function isActiveProject(id: number): boolean {
    return String(route.name ?? "").startsWith("project") && _id("id") === id;
  }
  function isActivePipeline(id: number): boolean {
    const name = String(route.name ?? "");
    return (
      (name.startsWith("pipeline") && _id("id") === id) ||
      ((name.startsWith("task") || name.startsWith("pipeline-stage")) &&
        _id("pipelineId") === id)
    );
  }

  function navigateToProject(project: Project): void {
    router.push({ name: "project-detail", params: { id: project.id } });
    const next = new Set(expandedProjects.value);
    next.add(project.id);
    expandedProjects.value = next;
    loadPipelinesForProject(project.id);
  }

  function addProject(): void {
    if (workspaceStore.activeWorkspace)
      router.push({
        name: "project-add",
        params: { workspaceId: workspaceStore.activeWorkspace.id },
      });
    else router.push({ name: "workspace" });
  }

  function viewProject(): void {
    if (workspaceStore.activeWorkspace)
      router.push({
        name: "project-index",
        params: { workspaceId: workspaceStore.activeWorkspace.id },
      });
    else router.push({ name: "workspace" });
  }

  // ── Context actions ───────────────────────────────────────────────────────────
  function ctxDetail(p: Project): void {
    ctxOpenId.value = null;
    router.push({ name: "project-detail", params: { id: p.id } });
  }
  function ctxEdit(p: Project): void {
    ctxOpenId.value = null;
    router.push({ name: "project-edit", params: { id: p.id } });
  }
  function ctxAddPipeline(p: Project): void {
    ctxOpenId.value = null;
    router.push({ name: "pipeline-add", params: { projectId: p.id } });
  }
  function ctxViewPipelines(p: Project): void {
    ctxOpenId.value = null;
    router.push({ name: "pipeline-index", params: { projectId: p.id } });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  onMounted(async () => {
    workspacesLoading.value = true;
    try {
      await workspaceStore.fetchWorkspaces({ page: 1, perPage: 10 });
    } catch {
      /**/
    } finally {
      workspacesLoading.value = false;
    }
    await loadProjects();
  });

  watch(
    () => workspaceStore.activeWorkspace?.id,
    () => {
      projectPipelines.value = new Map();
      expandedProjects.value = new Set();
      loadProjects();
    },
  );
</script>
