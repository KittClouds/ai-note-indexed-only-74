
import React from 'react';
import { Bot } from 'lucide-react';
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { useAICompletion } from '@/hooks/useAICompletion';
import { ChatContainer, ChatForm, ChatMessages } from "@/components/ui/chat";
import { MessageInput } from "@/components/ui/message-input";
import { MessageList } from "@/components/ui/message-list";

const AISidebar = () => {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const { generateCompletion } = useAICompletion({
    onComplete: (completion) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: completion
      }]);
      setIsLoading(false);
    },
    onError: (error) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error}`
      }]);
      setIsLoading(false);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const currentInput = input;
    setInput('');
    
    await generateCompletion(currentInput, 'continue');
  };

  const stop = () => {
    setIsLoading(false);
  };

  const lastMessage = messages.at(-1);
  const isEmpty = messages.length === 0;
  const isTyping = lastMessage?.role === "user";

  return (
    <>
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary bg-inherit" />
          <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden p-0 flex-1">
        <div className="h-full flex flex-col">
          <ChatContainer>
            {!isEmpty ? (
              <ChatMessages>
                <MessageList messages={messages} isTyping={isTyping} />
              </ChatMessages>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center py-8 text-muted-foreground">
                <div>
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-60" />
                  <h3 className="text-lg font-medium mb-2">AI Assistant</h3>
                  <p className="text-sm">
                    Ask me anything about your notes or get help with writing.
                  </p>
                </div>
              </div>
            )}

            <ChatForm
              className="mt-auto"
              isPending={isLoading || isTyping}
              handleSubmit={handleSubmit}
            >
              {({ files, setFiles }) => (
                <MessageInput
                  value={input}
                  onChange={handleInputChange}
                  allowAttachments
                  files={files}
                  setFiles={setFiles}
                  stop={stop}
                  isGenerating={isLoading}
                />
              )}
            </ChatForm>
          </ChatContainer>
        </div>
      </SidebarContent>
    </>
  );
};

export default AISidebar;
