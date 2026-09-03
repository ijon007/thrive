import {
    GlassTabBar,
    GlassTabButton,
    TabBarMinimizeProvider,
    renderFadingTabScreen,
    type GlassTabItem,
} from "expo-glass-tabs";
import { useRouter } from "expo-router";
import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";

const ITEMS: (GlassTabItem & { href: string })[] = [
  { name: "index", href: "/", label: "Quotes", icon: "quote.opening" },
  { name: "explore", href: "/explore", label: "Explore", icon: "safari.fill" },
  {
    name: "profile",
    href: "/profile",
    label: "Settings",
    icon: "gearshape.fill",
  },
];

export default function TabLayout() {
  const router = useRouter();

  return (
    <TabBarMinimizeProvider>
      <Tabs>
        <TabSlot style={{ height: "100%" }} renderFn={renderFadingTabScreen} />
        <TabList asChild>
          <GlassTabBar
            onIndexSelected={(i) => router.navigate(ITEMS[i].href as never)}
          >
            {ITEMS.map(({ href, ...item }, index) => (
              <TabTrigger
                key={item.name}
                name={item.name}
                href={href as never}
                asChild
              >
                <GlassTabButton item={item} index={index} />
              </TabTrigger>
            ))}
          </GlassTabBar>
        </TabList>
      </Tabs>
    </TabBarMinimizeProvider>
  );
}
