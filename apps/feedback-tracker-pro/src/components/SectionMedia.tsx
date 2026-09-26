import { useState, useRef } from 'react';
import { Button } from '@project/components/ui/button';
import { Textarea } from '@project/components/ui/textarea';
import { uploadFile } from '@/api/upload';
import { Paperclip, Mic, MicOff, X, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Attachment, SectionData } from '../types/assessment';

type Props = {
  data: SectionData;
  onChange: (data: SectionData) => void;
};

export default function SectionMedia({ data, onChange }: Props) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<SectionData>) => onChange({ ...data, ...patch });
  const removeAt = (i: number) => update({ attachments: data.attachments.filter((_, j) => j !== i) });

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: Attachment[] = await Promise.all(files.map(async f => {
        const { fileUrl } = await uploadFile({ data: f, filename: f.name });
        return { url: fileUrl, name: f.name, type: f.type.startsWith('image/') ? 'image' as const : 'file' as const };
      }));
      update({ attachments: [...data.attachments, ...uploaded] });
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          const { fileUrl } = await uploadFile({ data: blob, filename: `voice-${Date.now()}.webm` });
          update({ attachments: [...data.attachments, { url: fileUrl, name: `Voice Note`, type: 'voice' }] });
        } catch { toast.error('Voice upload failed'); }
      };
      recorder.start(); mediaRecorderRef.current = recorder; setRecording(true);
    } catch { toast.error('Microphone access denied'); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  return (
    <div className="space-y-3 pt-2">
      <Textarea placeholder="Add notes for this section..." value={data.notes} onChange={e => update({ notes: e.target.value })} rows={3} className="resize-none text-sm" />
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Paperclip className="h-3.5 w-3.5" />{uploading ? 'Uploading…' : 'Attach Files'}
        </Button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} accept="image/*,.pdf,.doc,.docx" />
        <Button type="button" variant={recording ? 'destructive' : 'outline'} size="sm" className="gap-1.5 text-xs" onClick={recording ? stopRecording : startRecording}>
          {recording ? <><MicOff className="h-3.5 w-3.5" />Stop</> : <><Mic className="h-3.5 w-3.5" />Voice Note</>}
        </Button>
        {recording && <span className="text-xs text-destructive font-medium animate-pulse">● Recording…</span>}
      </div>
      {data.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-muted/50 border rounded-lg px-2.5 py-1.5 text-xs max-w-[160px]">
              {att.type === 'image' ? <Image className="h-3 w-3 text-blue-500 flex-shrink-0" /> : att.type === 'voice' ? <Mic className="h-3 w-3 text-rose-500 flex-shrink-0" /> : <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
              <span className="truncate flex-1">{att.name}</span>
              <button type="button" onClick={() => removeAt(i)}><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
