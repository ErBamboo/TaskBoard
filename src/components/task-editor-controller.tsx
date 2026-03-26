"use client";

import { ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TaskEditorDrawer } from "./task-editor-drawer";

type TaskEditorControllerProps = {
  children: ReactNode;
};

export function TaskEditorController({
  children,
}: TaskEditorControllerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const editTaskId = searchParams.get("editTaskId");
  const createNew = searchParams.get("new") === "true";

  const isOpen = !!editTaskId || createNew;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("editTaskId");
    params.delete("new");
    router.push(`${pathname}${params.toString() ? "?" + params.toString() : ""}`, { scroll: false });
  };

  return (
    <TaskEditorDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={editTaskId ? "编辑任务详情" : "录入新执行项"}
    >
      {children}
    </TaskEditorDrawer>
  );
}
