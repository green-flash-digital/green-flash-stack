import { useCallback } from "react";
import { data, redirect, useFetcher, useLoaderData } from "react-router";

import { makeFontWeight, makeReset, makeRem, makeSpace } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { InputLabel } from "~/components/InputLabel";
import { InputSection } from "~/components/InputSection";
import { VariantAdd } from "~/components/VariantAdd";
import { VariantContainer } from "~/components/VariantContainer";
import { VariantEmpty } from "~/components/VariantEmpty";
import { VariantList } from "~/components/VariantList";
import { UserContext } from "~/saas/auth/auth.context";
import { DBControllerContext } from "~/saas/database/database.context";
import { activeProjectCookie } from "~/saas/projects/projects.activeProjectCookie";
import { errors } from "~/utils/util.error-modes";

import type { Route } from "./+types/projects";

const pageStyles = css`
  max-width: ${makeRem(640)};
  margin: ${makeSpace(48)} auto;
  padding: 0 ${makeSpace(24)};
`;

const rowButtonStyles = css`
  ${makeReset("button")};
  display: block;
  width: 100%;
  text-align: left;
  font-size: ${makeRem(14)};
  font-weight: ${makeFontWeight("mulish-medium")};
`;

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.get(DBControllerContext);
  const user = context.get(UserContext);
  if (!db || !user) {
    throw errors.API_ERROR(500, new Error("No database or user configured"));
  }

  const projects = await db.projects.listForOwner(user.id);
  return { projects };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.get(DBControllerContext);
  const user = context.get(UserContext);
  if (!db || !user) {
    throw errors.API_ERROR(500, new Error("No database or user configured"));
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent"));

  if (intent === "create") {
    const existing = await db.projects.listForOwner(user.id);
    const project = await db.projects.create(user.id, `Design System ${existing.length + 1}`);
    return redirect("/config", {
      headers: { "Set-Cookie": await activeProjectCookie.serialize(project.id) }
    });
  }

  if (intent === "select") {
    const projectId = String(formData.get("projectId"));
    // Never trust the posted id blindly, even though it came from this user's own list.
    const project = await db.projects.getOwned(projectId, user.id);
    if (!project) {
      return data({ error: "That design system could not be found." }, { status: 404 });
    }
    return redirect("/config", {
      headers: { "Set-Cookie": await activeProjectCookie.serialize(project.id) }
    });
  }

  return data({ error: "Unknown request." }, { status: 400 });
}

export default function ProjectsRoute() {
  const { projects } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleAdd = useCallback(() => {
    fetcher.submit({ intent: "create" }, { method: "post" });
  }, [fetcher]);

  const handleSelect = useCallback(
    (projectId: string) => {
      fetcher.submit({ intent: "select", projectId }, { method: "post" });
    },
    [fetcher]
  );

  return (
    <div className={pageStyles}>
      <InputSection>
        <InputLabel
          dxLabel="Your design systems"
          dxHelp="Pick a design system to continue editing, or create a new one."
        />
        {projects.length === 0 ? (
          <VariantEmpty
            dxMessage="No design systems have been created yet"
            dxActionMessage="Create your first design system"
            dxOnAdd={handleAdd}
          />
        ) : (
          <VariantList>
            {projects.map((project) => (
              <li key={project.id}>
                <VariantContainer dxStyle="alt">
                  <button
                    type="button"
                    className={rowButtonStyles}
                    onClick={() => handleSelect(project.id)}
                  >
                    {project.name}
                  </button>
                </VariantContainer>
              </li>
            ))}
            <li>
              <VariantAdd onAdd={handleAdd}>Add another design system</VariantAdd>
            </li>
          </VariantList>
        )}
      </InputSection>
    </div>
  );
}
