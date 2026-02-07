"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const DropDrawerContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

const useDropDrawerContext = () => {
  const context = React.useContext(DropDrawerContext);
  if (!context) {
    throw new Error(
      "DropDrawer components cannot be rendered outside the DropDrawer Context"
    );
  }
  return context;
};

interface SubmenuContextType {
  activeSubmenu: string | null;
  setActiveSubmenu: (id: string | null) => void;
  submenuTitle: string | null;
  setSubmenuTitle: (title: string | null) => void;
  navigateToSubmenu?: (id: string, title: string) => void;
  registerSubmenuContent?: (id: string, content: React.ReactNode[]) => void;
}

const SubmenuContext = React.createContext<SubmenuContextType>({
  activeSubmenu: null,
  setActiveSubmenu: () => {},
  submenuTitle: null,
  setSubmenuTitle: () => {},
});

let submenuIdCounter = 0;

function DropDrawer({
  children,
  ...props
}:
  | React.ComponentProps<typeof Drawer>
  | React.ComponentProps<typeof DropdownMenu>) {
  const isMobile = useIsMobile();
  const DropdownComponent = isMobile ? Drawer : DropdownMenu;

  return (
    <DropDrawerContext.Provider value={{ isMobile }}>
      <DropdownComponent
        data-slot="drop-drawer"
        {...(isMobile && { autoFocus: true })}
        {...props}
      >
        {children}
      </DropdownComponent>
    </DropDrawerContext.Provider>
  );
}

function DropDrawerTrigger({
  className,
  children,
  ...props
}:
  | React.ComponentProps<typeof DrawerTrigger>
  | React.ComponentProps<typeof DropdownMenuTrigger>) {
  const { isMobile } = useDropDrawerContext();
  const TriggerComponent = isMobile ? DrawerTrigger : DropdownMenuTrigger;

  return (
    <TriggerComponent
      data-slot="drop-drawer-trigger"
      className={className}
      {...props}
    >
      {children}
    </TriggerComponent>
  );
}

function DropDrawerContent({
  className,
  children,
  ...props
}:
  | React.ComponentProps<typeof DrawerContent>
  | React.ComponentProps<typeof DropdownMenuContent>) {
  const { isMobile } = useDropDrawerContext();
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);
  const [submenuTitle, setSubmenuTitle] = React.useState<string | null>(null);
  const [submenuStack, setSubmenuStack] = React.useState<
    { id: string; title: string }[]
  >([]);
  const [animationDirection, setAnimationDirection] = React.useState<
    "forward" | "backward"
  >("forward");

  const submenuContentRef = React.useRef<Map<string, React.ReactNode[]>>(
    new Map()
  );

  const navigateToSubmenu = React.useCallback((id: string, title: string) => {
    setAnimationDirection("forward");
    setActiveSubmenu(id);
    setSubmenuTitle(title);
    setSubmenuStack((prev) => [...prev, { id, title }]);
  }, []);

  const goBack = React.useCallback(() => {
    setAnimationDirection("backward");
    if (submenuStack.length <= 1) {
      setActiveSubmenu(null);
      setSubmenuTitle(null);
      setSubmenuStack([]);
    } else {
      const newStack = [...submenuStack];
      newStack.pop();
      const previous = newStack[newStack.length - 1];
      setActiveSubmenu(previous.id);
      setSubmenuTitle(previous.title);
      setSubmenuStack(newStack);
    }
  }, [submenuStack]);

  const registerSubmenuContent = React.useCallback(
    (id: string, content: React.ReactNode[]) => {
      submenuContentRef.current.set(id, content);
    },
    []
  );

  const extractSubmenuContent = React.useCallback(
    (elements: React.ReactNode, targetId: string): React.ReactNode[] => {
      const result: React.ReactNode[] = [];
      const findSubmenuContent = (node: React.ReactNode) => {
        if (!React.isValidElement(node)) return;
        const element = node as React.ReactElement;
        const props = element.props as {
          id?: string;
          "data-submenu-id"?: string;
          children?: React.ReactNode;
        };
        if (element.type === DropDrawerSub) {
          const elementId = props.id;
          const dataSubmenuId = props["data-submenu-id"];
          if (elementId === targetId || dataSubmenuId === targetId) {
            if (props.children) {
              React.Children.forEach(props.children, (child) => {
                if (
                  React.isValidElement(child) &&
                  child.type === DropDrawerSubContent
                ) {
                  const subContentProps = child.props as {
                    children?: React.ReactNode;
                  };
                  if (subContentProps.children) {
                    React.Children.forEach(
                      subContentProps.children,
                      (contentChild) => {
                        result.push(contentChild);
                      }
                    );
                  }
                }
              });
            }
            return;
          }
        }
        if (props.children) {
          if (Array.isArray(props.children)) {
            props.children.forEach((child: React.ReactNode) =>
              findSubmenuContent(child)
            );
          } else {
            findSubmenuContent(props.children);
          }
        }
      };
      if (Array.isArray(elements)) {
        elements.forEach((child) => findSubmenuContent(child));
      } else {
        findSubmenuContent(elements);
      }
      return result;
    },
    []
  );

  const getSubmenuContent = React.useCallback(
    (id: string) => {
      const cachedContent = submenuContentRef.current.get(id || "");
      if (cachedContent && cachedContent.length > 0) return cachedContent;
      const submenuContent = extractSubmenuContent(children, id);
      if (submenuContent.length === 0) return [];
      if (id) submenuContentRef.current.set(id, submenuContent);
      return submenuContent;
    },
    [children, extractSubmenuContent]
  );

  const variants = {
    enter: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const transition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] };

  if (isMobile) {
    return (
      <SubmenuContext.Provider
        value={{
          activeSubmenu,
          setActiveSubmenu: (id) => {
            if (id === null) {
              setActiveSubmenu(null);
              setSubmenuTitle(null);
              setSubmenuStack([]);
            }
          },
          submenuTitle,
          setSubmenuTitle,
          navigateToSubmenu,
          registerSubmenuContent,
        }}
      >
        <DrawerContent
          data-slot="drop-drawer-content"
          className={cn("max-h-[90vh]", className)}
          {...props}
        >
          {activeSubmenu ? (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goBack}
                    className="hover:bg-muted/50 rounded-full p-1"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <DrawerTitle>{submenuTitle || "Submenu"}</DrawerTitle>
                </div>
              </DrawerHeader>
              <div className="flex-1 relative overflow-y-auto max-h-[70vh]">
                <AnimatePresence
                  initial={false}
                  mode="wait"
                  custom={animationDirection}
                >
                  <motion.div
                    key={activeSubmenu || "main"}
                    custom={animationDirection}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    className="pb-6 space-y-1.5 w-full h-full"
                  >
                    {activeSubmenu
                      ? getSubmenuContent(activeSubmenu)
                      : children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <DrawerHeader className="sr-only">
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto max-h-[70vh]">
                <AnimatePresence
                  initial={false}
                  mode="wait"
                  custom={animationDirection}
                >
                  <motion.div
                    key="main-menu"
                    custom={animationDirection}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    className="pb-6 space-y-1.5 w-full"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          )}
        </DrawerContent>
      </SubmenuContext.Provider>
    );
  }

  return (
    <SubmenuContext.Provider
      value={{
        activeSubmenu,
        setActiveSubmenu,
        submenuTitle,
        setSubmenuTitle,
        registerSubmenuContent,
      }}
    >
      <DropdownMenuContent
        data-slot="drop-drawer-content"
        align="end"
        sideOffset={4}
        className={cn(
          "max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[220px] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}
      </DropdownMenuContent>
    </SubmenuContext.Provider>
  );
}

function DropDrawerItem({
  className,
  children,
  onSelect,
  onClick,
  icon,
  variant = "default",
  inset,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof DropdownMenuItem>, "variant"> & {
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (onClick) onClick(e);
      if (onSelect) onSelect(e as unknown as Event);
    };

    return (
      <DrawerClose asChild>
        <div
          data-slot="drop-drawer-item"
          data-variant={variant}
          data-inset={inset}
          data-disabled={disabled}
          className={cn(
            "flex cursor-pointer items-center justify-between bg-accent dark:bg-accent mx-2 my-1.5 rounded-md px-4 py-4",
            inset && "pl-8",
            variant === "destructive" &&
              "text-destructive dark:text-destructive",
            disabled && "pointer-events-none opacity-50",
            className
          )}
          onClick={handleClick}
          aria-disabled={disabled}
          {...props}
        >
          <div className="flex items-center gap-2">{children}</div>
          {icon && <div className="flex-shrink-0">{icon}</div>}
        </div>
      </DrawerClose>
    );
  }

  return (
    <DropdownMenuItem
      data-slot="drop-drawer-item"
      data-variant={variant}
      data-inset={inset}
      className={cn(
        variant === "destructive" && "text-destructive",
        className
      )}
      onSelect={onSelect}
      onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
      inset={inset}
      disabled={disabled}
      {...props}
    >
      <div className="flex w-full items-center justify-between">
        <div>{children}</div>
        {icon && <div>{icon}</div>}
      </div>
    </DropdownMenuItem>
  );
}

function DropDrawerSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  const { isMobile } = useDropDrawerContext();
  if (isMobile) return null;
  return (
    <DropdownMenuSeparator
      data-slot="drop-drawer-separator"
      className={className}
      {...props}
    />
  );
}

function DropDrawerLabel({
  className,
  children,
  ...props
}:
  | React.ComponentProps<typeof DropdownMenuLabel>
  | React.ComponentProps<typeof DrawerTitle>) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    return (
      <DrawerHeader className="p-0">
        <DrawerTitle
          data-slot="drop-drawer-label"
          className={cn(
            "text-muted-foreground px-4 py-2 text-sm font-medium",
            className
          )}
          {...props}
        >
          {children}
        </DrawerTitle>
      </DrawerHeader>
    );
  }

  return (
    <DropdownMenuLabel
      data-slot="drop-drawer-label"
      className={className}
      {...props}
    >
      {children}
    </DropdownMenuLabel>
  );
}

function DropDrawerFooter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerFooter> | React.ComponentProps<"div">) {
  const { isMobile } = useDropDrawerContext();

  if (isMobile) {
    return (
      <DrawerFooter
        data-slot="drop-drawer-footer"
        className={cn("p-4", className)}
        {...props}
      >
        {children}
      </DrawerFooter>
    );
  }

  return (
    <div
      data-slot="drop-drawer-footer"
      className={cn("p-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function DropDrawerGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { isMobile } = useDropDrawerContext();

  const childrenWithSeparators = React.useMemo(() => {
    if (!isMobile) return children;
    const childArray = React.Children.toArray(children);
    const filteredChildren = childArray.filter(
      (child) =>
        React.isValidElement(child) && child.type !== DropDrawerSeparator
    );
    return filteredChildren.flatMap((child, index) => {
      if (index === filteredChildren.length - 1) return [child];
      return [
        child,
        <div
          key={`separator-${index}`}
          className="bg-border h-px"
          aria-hidden="true"
        />,
      ];
    });
  }, [children, isMobile]);

  if (isMobile) {
    return (
      <div
        data-drop-drawer-group
        data-slot="drop-drawer-group"
        role="group"
        className={cn(
          "bg-accent dark:bg-accent mx-2 my-3 overflow-hidden rounded-xl",
          className
        )}
        {...props}
      >
        {childrenWithSeparators}
      </div>
    );
  }

  return (
    <div
      data-drop-drawer-group
      data-slot="drop-drawer-group"
      role="group"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

function DropDrawerSub({
  children,
  id,
  ...props
}: React.ComponentProps<typeof DropdownMenuSub> & { id?: string }) {
  const { isMobile } = useDropDrawerContext();
  const { registerSubmenuContent } = React.useContext(SubmenuContext);
  const [generatedId] = React.useState(() => `submenu-${submenuIdCounter++}`);
  const submenuId = id || generatedId;

  React.useEffect(() => {
    if (!registerSubmenuContent) return;
    const contentItems: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === DropDrawerSubContent) {
        React.Children.forEach(
          (child.props as { children?: React.ReactNode }).children,
          (contentChild) => {
            contentItems.push(contentChild);
          }
        );
      }
    });
    if (contentItems.length > 0) registerSubmenuContent(submenuId, contentItems);
  }, [children, registerSubmenuContent, submenuId]);

  if (isMobile) {
    return (
      <div data-slot="drop-drawer-sub" data-submenu-id={submenuId} id={submenuId}>
        {children}
      </div>
    );
  }

  return (
    <DropdownMenuSub data-slot="drop-drawer-sub" {...props}>
      {children}
    </DropdownMenuSub>
  );
}

function DropDrawerSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger>) {
  const { isMobile } = useDropDrawerContext();
  const { navigateToSubmenu } = React.useContext(SubmenuContext);

  if (isMobile) {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const element = e.currentTarget as HTMLElement;
      const closestElement = element.closest("[data-submenu-id]");
      const submenuId = closestElement?.getAttribute("data-submenu-id");
      if (!submenuId) return;
      const title = typeof children === "string" ? children : "Submenu";
      navigateToSubmenu?.(submenuId, title);
    };

    return (
      <div
        data-slot="drop-drawer-sub-trigger"
        data-inset={inset}
        className={cn(
          "flex cursor-pointer items-center justify-between bg-accent dark:bg-accent mx-2 my-1.5 rounded-md px-4 py-4",
          inset && "pl-8",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-center gap-2">{children}</div>
        <ChevronRightIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <DropdownMenuSubTrigger
      data-slot="drop-drawer-sub-trigger"
      className={className}
      inset={inset}
      {...props}
    >
      {children}
    </DropdownMenuSubTrigger>
  );
}

function DropDrawerSubContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  const { isMobile } = useDropDrawerContext();
  if (isMobile) return null;

  return (
    <DropdownMenuSubContent
      data-slot="drop-drawer-sub-content"
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuSubContent>
  );
}

export {
  DropDrawer,
  DropDrawerContent,
  DropDrawerFooter,
  DropDrawerGroup,
  DropDrawerItem,
  DropDrawerLabel,
  DropDrawerSeparator,
  DropDrawerSub,
  DropDrawerSubContent,
  DropDrawerSubTrigger,
  DropDrawerTrigger,
};
