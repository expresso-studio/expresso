"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

/**
 * Renders a collapsible section with a trigger and content.
 * @param props - The props for the Collapsible component.
 * @returns The rendered collapsible component.
 */
const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
