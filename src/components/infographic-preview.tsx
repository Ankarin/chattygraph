'use client';

import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface InfographicPreviewProps {
    html: string;
    className?: string;
}

export function InfographicPreview({ html, className = '' }: InfographicPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [scale, setScale] = useState(0.5);

    const exportToPng = useCallback(async () => {
        if (!iframeRef.current) return;

        setIsExporting(true);
        try {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

            if (!iframeDoc) {
                throw new Error('Could not access iframe document');
            }

            // Find the .infographic element
            const infographicEl = iframeDoc.querySelector('.infographic') as HTMLElement;
            if (!infographicEl) {
                throw new Error('No .infographic element found');
            }

            // Use html2canvas on the infographic element
            const canvas = await html2canvas(infographicEl, {
                scale: 2, // 2x for retina quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false,
            });

            // Convert to PNG and download
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `infographic-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Make sure the infographic has a .infographic class wrapper.');
        } finally {
            setIsExporting(false);
        }
    }, []);

    const copyHtml = useCallback(() => {
        navigator.clipboard.writeText(html);
    }, [html]);

    const openInNewTab = useCallback(() => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
        }
    }, [html]);

    // Construct the full HTML document for the iframe
    const iframeSrcDoc = html;

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant="default"
                    size="sm"
                    onClick={exportToPng}
                    disabled={isExporting}
                    className="gap-2"
                >
                    {isExporting ? (
                        <Icons.Loader className="h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.Download className="h-4 w-4" />
                    )}
                    Export PNG
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyHtml}
                    className="gap-2"
                >
                    <Icons.Copy className="h-4 w-4" />
                    Copy HTML
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={openInNewTab}
                    className="gap-2"
                >
                    <Icons.ExternalLink className="h-4 w-4" />
                    Open Full Size
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-muted-foreground">Zoom:</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScale(s => Math.max(0.25, s - 0.1))}
                        className="h-7 w-7 p-0"
                    >
                        −
                    </Button>
                    <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScale(s => Math.min(1, s + 0.1))}
                        className="h-7 w-7 p-0"
                    >
                        +
                    </Button>
                </div>
            </div>

            {/* Preview Container */}
            <div className="relative border rounded-lg overflow-hidden bg-neutral-900">
                <div
                    className="overflow-auto"
                    style={{
                        maxHeight: '600px',
                    }}
                >
                    <div
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            width: `${100 / scale}%`,
                        }}
                    >
                        <iframe
                            ref={iframeRef}
                            srcDoc={iframeSrcDoc}
                            className="w-full border-0"
                            style={{
                                minHeight: '800px',
                                height: 'auto',
                            }}
                            sandbox="allow-same-origin"
                            title="Infographic Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Extracts HTML code blocks from markdown/text content
 */
export function extractHtmlFromContent(content: string): string | null {
    // Match ```html ... ``` code blocks
    const htmlBlockMatch = content.match(/```html\s*([\s\S]*?)```/);
    if (htmlBlockMatch) {
        return htmlBlockMatch[1].trim();
    }

    // Match ``` ... ``` that looks like HTML (starts with <!DOCTYPE or <html or <div)
    const genericBlockMatch = content.match(/```\s*(<!DOCTYPE[\s\S]*?)```/i);
    if (genericBlockMatch) {
        return genericBlockMatch[1].trim();
    }

    // Check if the entire content is HTML
    if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
        return content.trim();
    }

    return null;
}
