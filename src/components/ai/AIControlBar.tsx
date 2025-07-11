
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList } from '@/components/ui/command';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCcwDot, CheckCheck, ArrowDownWideNarrow, WrapText, StepForward, Sparkles, X, ChevronDown } from 'lucide-react';
import { useAICompletion } from '@/hooks/useAICompletion';
import { TTSButton } from '@/components/TTSButton';
import AISelectorCommands from './AISelectorCommands';
import AICompletionCommands from './AICompletionCommands';
import { useRightSidebar } from '@/components/RightSidebarProvider';
import { useIsMobile } from '@/hooks/use-mobile';

interface AIControlBarProps {
  editor: any;
  isDarkMode?: boolean;
}

const aiOptions = [
  { key: 'continue', label: 'Continue', icon: StepForward },
  { key: 'improve', label: 'Improve', icon: RefreshCcwDot },
  { key: 'fix', label: 'Fix Grammar', icon: CheckCheck },
  { key: 'shorter', label: 'Shorter', icon: ArrowDownWideNarrow },
  { key: 'longer', label: 'Longer', icon: WrapText },
];

const AIControlBar = ({ editor, isDarkMode }: AIControlBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'selector' | 'completion'>('selector');
  const { open: rightSidebarOpen } = useRightSidebar();
  const isMobile = useIsMobile();
  
  const { completion, isLoading, error, generateCompletion, reset } = useAICompletion({
    onComplete: () => setMode('completion'),
    onError: (error) => console.error('AI Error:', error),
  });

  // Extract text from editor for TTS
  const getTextForTTS = (): string => {
    if (!editor) return '';
    
    const { from, to } = editor.state.selection;
    
    // If text is selected, use that
    if (from !== to) {
      return editor.state.doc.textBetween(from, to, ' ');
    }
    
    // Otherwise, use the entire document text
    return editor.state.doc.textContent || '';
  };

  const handleAISelect = async (text: string, option: string) => {
    setMode('completion');
    await generateCompletion(text, option);
  };

  const handleQuickAction = async (option: string) => {
    setIsOpen(true);
    setMode('completion');
    
    const { from, to } = editor.state.selection;
    let text = "";
    
    if (option === 'continue') {
      const pos = editor.state.selection.from;
      text = editor.state.doc.textBetween(Math.max(0, pos - 5000), pos, "\n");
    } else if (from !== to) {
      text = editor.state.doc.textBetween(from, to, "\n");
    } else {
      const pos = editor.state.selection.from;
      text = editor.state.doc.textBetween(Math.max(0, pos - 1000), pos, "\n");
    }
    
    await generateCompletion(text, option);
  };

  const handleDiscard = () => {
    reset();
    setIsOpen(false);
    setMode('selector');
  };

  if (!editor) return null;

  // Calculate positioning to avoid overlap with right sidebar
  const containerStyle = !isMobile && rightSidebarOpen ? {
    marginRight: '16rem' // Account for right sidebar width (w-64 = 16rem)
  } : {};

  return (
    <div className="border-t bg-background p-2" style={containerStyle}>
      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* AI Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-3 w-3" />
              AI Actions
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-background border shadow-md">
            {aiOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => handleQuickAction(option.key)}
                disabled={isLoading}
                className="flex items-center gap-2 cursor-pointer"
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />
        
        {/* TTS Button */}
        <TTSButton 
          text={getTextForTTS()} 
          className="h-9"
        />
      </div>

      {/* AI Command Interface */}
      {isOpen && (
        <Card className="mt-2 p-0 shadow-lg">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="text-sm font-medium">AI Assistant</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Command className="border-0">
            {mode === 'selector' && (
              <>
                <CommandInput placeholder="Ask AI to help with your writing..." />
                <CommandList className="max-h-[200px]">
                  <AISelectorCommands onSelect={handleAISelect} editor={editor} />
                </CommandList>
              </>
            )}
            
            {mode === 'completion' && (
              <div className="p-4">
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                    Generating response...
                  </div>
                )}
                
                {error && (
                  <div className="text-sm text-red-500 mb-4 p-3 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}
                
                {completion && (
                  <div className="space-y-4">
                    <div className="text-sm bg-muted p-3 rounded-md max-h-[200px] overflow-y-auto">
                      <div className="whitespace-pre-wrap">{completion}</div>
                    </div>
                    
                    <Command>
                      <CommandList>
                        <AICompletionCommands
                          completion={completion}
                          onDiscard={handleDiscard}
                          editor={editor}
                        />
                      </CommandList>
                    </Command>
                  </div>
                )}
                
                {!isLoading && !completion && !error && (
                  <div className="text-sm text-muted-foreground">
                    Select text and choose an AI action to get started.
                  </div>
                )}
              </div>
            )}
          </Command>
        </Card>
      )}
    </div>
  );
};

export default AIControlBar;
