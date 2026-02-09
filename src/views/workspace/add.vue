<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            class="h-9 w-9"
            @click="router.back()"
            title="Go back"
          >
            <ArrowLeft class="h-5 w-5" />
          </Button>
          <div>
            <h1 class="text-4xl font-bold text-foreground mb-2">
              Create Workspace
            </h1>
            <p class="text-muted-foreground">
              Add a new workspace to organize your work
            </p>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5 text-primary" />
            Workspace Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name Field -->
            <div class="space-y-2">
              <Label for="name" class="text-sm font-semibold text-foreground">
                Workspace Name
                <span class="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Enter workspace name"
                :class="{ 'border-destructive focus:border-destructive focus:ring-destructive': errors.name }"
                required
              />
              <p v-if="errors.name" class="text-xs text-destructive mt-1">
                {{ errors.name }}
              </p>
            </div>

            <!-- Description Field -->
            <div class="space-y-2">
              <Label for="description" class="text-sm font-semibold text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Enter workspace description (optional)"
                rows="4"
                :class="{ 'border-destructive focus:border-destructive focus:ring-destructive': errors.description }"
              />
              <p v-if="errors.description" class="text-xs text-destructive mt-1">
                {{ errors.description }}
              </p>
              <p class="text-xs text-muted-foreground">
                Provide a brief description of what this workspace is for
              </p>
            </div>

            <!-- Error Alert -->
            <Alert v-if="workspaceStore.hasError" variant="destructive">
              <AlertTriangle class="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {{ workspaceStore.errorMessage }}
              </AlertDescription>
            </Alert>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                @click="router.back()"
                class="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                :disabled="workspaceStore.isLoading"
                class="flex-1 gap-2"
              >
                <Loader2 v-if="workspaceStore.isLoading" class="h-4 w-4 animate-spin" />
                <span>{{ workspaceStore.isLoading ? 'Creating...' : 'Create Workspace' }}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Tips Card -->
      <Card class="mt-6">
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <Info class="h-4 w-4 text-primary" />
            Tips
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <CheckCircle2 class="h-4 w-4 text-primary" />
            </div>
            <p class="text-sm text-muted-foreground">
              Choose a clear, descriptive name that helps you identify the workspace quickly
            </p>
          </div>
          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <CheckCircle2 class="h-4 w-4 text-primary" />
            </div>
            <p class="text-sm text-muted-foreground">
              Add a description to help team members understand the workspace's purpose
            </p>
          </div>
          <div class="flex gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <CheckCircle2 class="h-4 w-4 text-primary" />
            </div>
            <p class="text-sm text-muted-foreground">
              You can always edit these details later from the workspace settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useWorkspaceStore } from "@/stores/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
} from "lucide-vue-next";

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const form = reactive({
  name: "",
  description: "",
});

const errors = reactive({
  name: "",
  description: "",
});

function validateForm(): boolean {
  errors.name = "";
  errors.description = "";

  let isValid = true;

  if (!form.name.trim()) {
    errors.name = 'Workspace name is required'
    isValid = false
  } else if (form.name.trim().length < 3) {
    errors.name = 'Workspace name must be at least 3 characters'
    isValid = false
  } else if (form.name.trim().length > 255) {
    errors.name = 'Workspace name must not exceed 255 characters'
    isValid = false
  }

  if (form.description && form.description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  workspaceStore.clearError()

  if (!validateForm()) {
    return
  }

  try {
    const workspace = await workspaceStore.createWorkspace({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    })

    router.push({ name: 'workspace-detail', params: { id: workspace.id } })
  } catch (error) {
    console.error('Failed to create workspace:', error)
  }
}
</script>
