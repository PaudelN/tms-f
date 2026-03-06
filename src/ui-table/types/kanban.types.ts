// kanban.types.ts

export interface KanbanStageDefinition {
  value: string;
  label: string;
  dot?: string;
  colorClass?: string;
  textClass?: string;
  borderClass?: string;
  wipLimit?: number;
}

export interface KanbanMoveEvent<T> {
  item: T;
  fromStage: string;
  toStage: string;
  newIndex: number;
}

export interface KanbanReorderEvent {
  stage: string;
  orderedIds: (string | number)[];
}

export interface KanbanMovePayload {
  model_id: number | string;
  column_id: string;
}

export interface KanbanConfig {
  columnWidth?: string;
  stageKey?: string;
  perPage?: number;
}

export interface KanbanFeatures {
  dragDrop?: boolean;
  intraStageReorder?: boolean;
}
