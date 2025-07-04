
import React, { useState } from 'react';
import { Settings, Bot } from 'lucide-react';
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RightSidebar as RightSidebarWrapper } from './RightSidebarProvider';
import { EntityAttributePanelContainer } from './entity-attributes/EntityAttributePanelContainer';
import AISidebar from './AISidebar';

const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <RightSidebarWrapper className="border-l border-border/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <SidebarHeader className="p-4 border-b border-border/50">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
          </TabsList>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden p-0 flex-1">
          <TabsContent value="details" className="h-full m-0">
            <div className="h-full flex flex-col">
              <EntityAttributePanelContainer />
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="h-full m-0">
            <AISidebar />
          </TabsContent>
        </SidebarContent>
      </Tabs>
    </RightSidebarWrapper>
  );
};

export default RightSidebar;
