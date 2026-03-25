"use client";

import type { SetupMemberDraft } from "@/features/setup/setup-drafts";
import type { SetupMemberInput } from "@/features/setup/setup-schema";

type MemberImportStepProperties = {
  addMember: () => void;
  members: SetupMemberDraft[];
  removeMember: (index: number) => void;
  updateMember: (
    index: number,
    field: keyof SetupMemberInput,
    value: string,
  ) => void;
};

export function MemberImportStep({
  addMember,
  members,
  removeMember,
  updateMember,
}: MemberImportStepProperties) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4">
        {members.map((member, index) => (
          <article
            key={member.clientId}
            className="grid gap-4 rounded-[1.2rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.7)] p-4 md:grid-cols-[0.8fr_1.2fr_auto]"
          >
            <div className="grid gap-2">
              <label
                htmlFor={`setup-member-name-${index}`}
                className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]"
              >
                成员姓名
              </label>
              <input
                id={`setup-member-name-${index}`}
                type="text"
                value={member.displayName}
                onChange={(event) =>
                  updateMember(index, "displayName", event.currentTarget.value)
                }
                className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
                placeholder="例如：Alice"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor={`setup-member-email-${index}`}
                className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-[var(--color-muted)]"
              >
                邮箱
              </label>
              <input
                id={`setup-member-email-${index}`}
                type="email"
                value={member.email}
                onChange={(event) =>
                  updateMember(index, "email", event.currentTarget.value)
                }
                className="rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors duration-200 focus:border-[var(--color-accent)]"
                placeholder="例如：alice@example.com"
              />
            </div>

            <div className="flex items-end">
              {members.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="rounded-full border border-[var(--color-line)] px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted-strong)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  删除
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addMember}
          className="rounded-full border border-[var(--color-line-strong)] bg-[var(--color-panel)] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-ink)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          添加成员
        </button>
        <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
          成员账号会自动生成临时密码，完成后统一展示给管理员保存。
        </p>
      </div>
    </div>
  );
}
