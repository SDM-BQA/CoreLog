import { useCallback, useEffect, useRef } from "react";
import {
  useCreateJournalTemplateMutation,
  useDeleteJournalTemplateMutation,
  useGetJournalTemplatesQuery,
  useUpdateJournalTemplateMutation,
} from "../@store/api/journal.api";
import type { SavedJournalTemplate as ApiJournalTemplate, SavedJournalTemplateInput } from "../@apis/journal";
import {
  clearJournalTemplates,
  loadJournalTemplates,
  type JournalSavedTemplate,
  type JournalTemplateDraft,
} from "../@utils/journalTemplates.utils";

const mapTemplate = (template: ApiJournalTemplate): JournalSavedTemplate => ({
  id: template._id,
  name: template.name,
  content: template.content,
  category: template.category,
  created_at: template.created_at || "",
  updated_at: template.updated_at || template.created_at || "",
});

export const useJournalTemplates = (userId?: string) => {
  const migrationAttemptedRef = useRef<string | null>(null);
  const { data = [], refetch, isLoading, isFetching } = useGetJournalTemplatesQuery(undefined, {
    skip: !userId,
  });
  const [createTemplateMutation] = useCreateJournalTemplateMutation();
  const [updateTemplateMutation] = useUpdateJournalTemplateMutation();
  const [deleteTemplateMutation] = useDeleteJournalTemplateMutation();

  const templates = data.map(mapTemplate);

  const toInput = (draft: JournalTemplateDraft): SavedJournalTemplateInput => ({
    name: draft.name.trim(),
    content: draft.content,
    category: draft.category?.trim() || undefined,
  });

  useEffect(() => {
    if (!userId || isLoading || isFetching) return;
    if (migrationAttemptedRef.current === userId) return;
    migrationAttemptedRef.current = userId;

    const legacyTemplates = loadJournalTemplates(userId);
    if (!legacyTemplates.length) return;

    const currentSignatures = new Set(
      data.map((template: ApiJournalTemplate) =>
        JSON.stringify([
          template.name.trim().toLowerCase(),
          template.content.trim(),
          template.category?.trim().toLowerCase() || "",
        ]),
      ),
    );

    const templatesToImport = legacyTemplates.filter((template: JournalSavedTemplate) => {
      const signature = JSON.stringify([
        template.name.trim().toLowerCase(),
        template.content.trim(),
        template.category?.trim().toLowerCase() || "",
      ]);
      return !currentSignatures.has(signature);
    });

    const migrate = async () => {
      try {
        for (const template of templatesToImport) {
          await createTemplateMutation({
            name: template.name.trim(),
            content: template.content,
            category: template.category?.trim() || undefined,
          }).unwrap();
        }
        clearJournalTemplates(userId);
        if (templatesToImport.length > 0) {
          await refetch();
        }
      } catch {
        migrationAttemptedRef.current = null;
      }
    };

    void migrate();
  }, [createTemplateMutation, data, isFetching, isLoading, refetch, userId]);

  const createTemplate = useCallback(async (draft: JournalTemplateDraft) => {
    const result = await createTemplateMutation(toInput(draft)).unwrap();
    return mapTemplate(result);
  }, [createTemplateMutation]);

  const updateTemplate = useCallback(async (id: string, draft: JournalTemplateDraft) => {
    const result = await updateTemplateMutation({ id, input: toInput(draft) }).unwrap();
    return mapTemplate(result);
  }, [updateTemplateMutation]);

  const deleteTemplate = useCallback(async (id: string) => {
    await deleteTemplateMutation(id).unwrap();
  }, [deleteTemplateMutation]);

  const refreshTemplates = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates,
    isLoading,
    isFetching,
  };
};
