export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "member";
export type ProjectStatus = "planning" | "active" | "archived";
export type MilestoneStatus = "pending" | "active" | "completed";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskRelationType =
  | "depends_on"
  | "related_to"
  | "integration_input";

export type Database = {
  public: {
    Tables: {
      team_settings: {
        Row: {
          created_at: string;
          id: number;
          season_name: string;
          team_name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          season_name: string;
          team_name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          season_name?: string;
          team_name?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          created_at: string;
          display_name: string;
          email: string;
          id: string;
          is_active: boolean;
          role: UserRole;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          email: string;
          id: string;
          is_active?: boolean;
          role: UserRole;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          role?: UserRole;
        };
      };
      projects: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
          start_date: string | null;
          status: ProjectStatus;
          target_date: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
          start_date?: string | null;
          status?: ProjectStatus;
          target_date?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          start_date?: string | null;
          status?: ProjectStatus;
          target_date?: string | null;
        };
      };
      subsystems: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
          project_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
          project_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          project_id?: string;
          sort_order?: number;
        };
      };
      milestones: {
        Row: {
          created_at: string;
          description: string;
          due_date: string | null;
          id: string;
          name: string;
          project_id: string;
          status: MilestoneStatus;
        };
        Insert: {
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          name: string;
          project_id: string;
          status?: MilestoneStatus;
        };
        Update: {
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          name?: string;
          project_id?: string;
          status?: MilestoneStatus;
        };
      };
      tasks: {
        Row: {
          assignee_id: string;
          blocked_reason: string;
          completed_at: string | null;
          created_at: string;
          creator_id: string;
          description: string;
          due_at: string | null;
          group_tag: string;
          id: string;
          is_integration_task: boolean;
          milestone_id: string | null;
          priority: TaskPriority;
          project_id: string;
          status: TaskStatus;
          subsystem_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          assignee_id: string;
          blocked_reason?: string;
          completed_at?: string | null;
          created_at?: string;
          creator_id: string;
          description?: string;
          due_at?: string | null;
          group_tag: string;
          id?: string;
          is_integration_task?: boolean;
          milestone_id?: string | null;
          priority?: TaskPriority;
          project_id: string;
          status?: TaskStatus;
          subsystem_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          assignee_id?: string;
          blocked_reason?: string;
          completed_at?: string | null;
          created_at?: string;
          creator_id?: string;
          description?: string;
          due_at?: string | null;
          group_tag?: string;
          id?: string;
          is_integration_task?: boolean;
          milestone_id?: string | null;
          priority?: TaskPriority;
          project_id?: string;
          status?: TaskStatus;
          subsystem_id?: string;
          title?: string;
          updated_at?: string;
        };
      };
      task_relations: {
        Row: {
          created_at: string;
          id: string;
          relation_type: TaskRelationType;
          source_task_id: string;
          target_task_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          relation_type: TaskRelationType;
          source_task_id: string;
          target_task_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          relation_type?: TaskRelationType;
          source_task_id?: string;
          target_task_id?: string;
        };
      };
    };
  };
};
