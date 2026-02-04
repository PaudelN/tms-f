<script setup lang="ts">
import { 
  PlayIcon,
  FireIcon,
  ClockIcon,
  FolderIcon,
  EllipsisVerticalIcon,
} from '@heroicons/vue/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const stats = [
  { title: 'Weekly Activity', value: '0%', icon: FireIcon, color: 'text-primary' },
  { title: 'Worked This Week', value: '40:00:05', icon: ClockIcon, color: 'text-primary' },
  { title: 'Project Worked', value: '02', icon: FolderIcon, color: 'text-primary' },
]

const recentActivities = [
  { id: 1, title: 'Sushi Sano', image: '/activity1.png' },
  { id: 2, title: 'Project Two', image: '/activity2.png' },
  { id: 3, title: 'Project Three', image: '/activity3.png' },
  { id: 4, title: 'Project Four', image: '/activity4.png' },
]

const projects = [
  { name: 'Project one', time: '06:00:05', progress: 75, color: 'bg-primary' },
  { name: 'Project Two', time: '06:00:05', progress: 60, color: 'bg-primary' },
  { name: 'Project Three', time: '05:00:05', progress: 45, color: 'bg-primary' },
  { name: 'Project Four', time: '05:00:05', progress: 30, color: 'bg-primary' },
]

const members = [
  { name: 'John Walker', role: 'Frontend Developer', today: '09:00:05', thisWeek: '100:0:05' },
  { name: 'Sushi Sano', role: 'Product Designer', today: '09:00:05', thisWeek: '100:0:05' },
  { name: 'Project Name', role: 'Creative Head Research', today: '26:00:05', thisWeek: '100:0:05' },
]

const todos = [
  { task: 'Creating Wireframe', time: '09:00:05', progress: 75 },
  { task: 'Research Development', time: '05:00:05', progress: 90 },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Today</h1>
        <p class="text-sm text-muted-foreground mt-1">Mon 22, 2021 | 10:00 AM</p>
      </div>
      <Button size="lg" class="gap-2">
        Start Time Tracker
        <PlayIcon class="h-5 w-5" />
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.title">
        <CardHeader class="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            {{ stat.title }}
          </CardTitle>
          <Button variant="ghost" size="icon" class="h-8 w-8">
            <EllipsisVerticalIcon class="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-end justify-between">
            <div class="text-3xl font-bold">{{ stat.value }}</div>
            <component :is="stat.icon" :class="['h-8 w-8', stat.color]" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent Activity -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">Sushi Sano</span>
              <Button variant="ghost" size="sm" class="text-xs">
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden"
            >
              <div class="text-xs text-muted-foreground">Activity {{ activity.id }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Projects -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <EllipsisVerticalIcon class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="project in projects"
            :key="project.name"
            class="space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary" />
                <span>{{ project.name }}</span>
              </div>
              <span class="text-xs text-muted-foreground">{{ project.time }}</span>
            </div>
            <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                :class="project.color"
                :style="{ width: `${project.progress}%` }"
                class="h-full rounded-full transition-all"
              />
            </div>
          </div>
          <Button variant="default" size="sm" class="w-full mt-4">
            View All
          </Button>
        </CardContent>
      </Card>

      <!-- Members -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Members</CardTitle>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <EllipsisVerticalIcon class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span>Member Info</span>
            <span>Today</span>
            <span>This Week</span>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="member in members"
            :key="member.name"
            class="flex items-center gap-3"
          >
            <Avatar>
              <AvatarFallback class="bg-primary text-primary-foreground text-xs">
                {{ member.name.split(' ').map(n => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ member.name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ member.role }}</p>
            </div>
            <div class="text-xs text-muted-foreground">{{ member.today }}</div>
            <div class="text-xs text-muted-foreground">{{ member.thisWeek }}</div>
          </div>
          <Button variant="default" size="sm" class="w-full mt-4">
            View Team
          </Button>
        </CardContent>
      </Card>

      <!-- To Do -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>To Do</CardTitle>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <EllipsisVerticalIcon class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span>To Do</span>
            <span>Time</span>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="todo in todos"
            :key="todo.task"
            class="space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary" />
                <span>{{ todo.task }}</span>
              </div>
              <span class="text-xs text-muted-foreground">{{ todo.time }}</span>
            </div>
            <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                class="h-full bg-primary rounded-full transition-all"
                :style="{ width: `${todo.progress}%` }"
              />
            </div>
          </div>
          <Button variant="default" size="sm" class="w-full mt-4">
            View Task
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>