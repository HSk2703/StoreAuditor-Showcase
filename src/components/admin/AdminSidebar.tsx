import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Building2,
  CreditCard,
  ShieldCheck,
  TicketCheck,
  Star,
  ClipboardList,
  Plug,
  Brain,
  Globe2,
  FileText,
  AlertOctagon,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { key: "overview", title: "Overview", icon: LayoutDashboard },
  { key: "inquiries", title: "Direct Inquiries", icon: MessageSquare },
  { key: "individuals", title: "Individuals", icon: Users },
  { key: "agencies", title: "Agencies", icon: Building2 },
  { key: "subscribers", title: "Subscribers & Financials", icon: CreditCard },
  { key: "access", title: "Access Control", icon: ShieldCheck },
  { key: "tickets", title: "Tickets & Support", icon: TicketCheck },
  { key: "feedback", title: "Feedback", icon: Star },
  { key: "applications", title: "Applications", icon: ClipboardList },
  { key: "integrations", title: "Integrations", icon: Plug },
  { key: "behavioral", title: "Behavioral Analytics", icon: Brain },
  { key: "geo", title: "Geo Intelligence", icon: Globe2 },
  { key: "blog", title: "Blog Manager", icon: FileText },
  { key: "observability", title: "Observability", icon: AlertOctagon },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const active = searchParams.get("tab") || "overview";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={active === item.key}
                    onClick={() => navigate(`/admin?tab=${item.key}`)}
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
