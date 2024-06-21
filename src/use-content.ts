import { useMemo } from "react";
import { getMDXComponent } from "mdx-bundler/client";
import { Content } from "./ContentApi";

export const useContent = <T extends Content>(content: T) => {
  const Component = useMemo(() => {
    try {
      if (!content.data) {
        throw new Error("Missing data from content api");
      }
      return getMDXComponent(content.data);
    } catch (error) {
      throw new Error("Error rendering content");
    }
  }, [content]);

  return { Component };
};
