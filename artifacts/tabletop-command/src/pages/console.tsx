import React, { useState } from 'react';
import { useExerciseStore, type InjectStatus, type TheatricalEffect } from '@/store/exercise';
import { useTimer } from '@/hooks/use-timer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Square, ShieldAlert, AlertTriangle, EyeOff, Eye, Send, CheckCircle2, MonitorPlay, Plus, Shuffle, Edit3, Save, FileDown, Users } from 'lucide-react';

export default function Console() {
  const { state, setState } = useExerciseStore();
  const timer = useTimer(state);
  const [newHotWash, setNewHotWash] = useState('');
  const [hotWashTeam, setHotWashTeam] = useState('Team 1');
  const [hotWashQuestion, setHotWashQuestion] = useState('Observation');
  const [editingInject, setEditingInject] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const handleStart = () => {
    setState(s => ({
      ...s,
      status: 'running',
      endTime: Date.now() + s.durationLeft
    }));
  };

  const handlePause = () => {
    setState(s => {
      if (s.status !== 'running' || !s.endTime) return s;
      return {
        ...s,
        status: 'paused',
        durationLeft: Math.max(0, s.endTime - Date.now()),
        endTime: null
      };
    });
  };

  const handleReset = () => {
    if(confirm("Are you sure you want to reset the exercise to initial state?")) {
       setState(s => ({
          ...s,
          status: 'setup',
          durationLeft: 60 * 60 * 1000,
          endTime: null,
          injects: s.injects.map(i => ({ ...i, status: 'pending', deployedAt: undefined }))
       }));
    }
  }

  const handleEffect = (effect: TheatricalEffect) => {
    setState(s => ({ ...s, effect }));
    if (effect !== 'none') {
      try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = effect === 'alarm' ? 440 : 180;
        oscillator.type = 'square';
        gain.gain.setValueAtTime(0.04, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.45);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.45);
      } catch {
        // Audio remains optional in browsers that do not allow Web Audio.
      }
    }
  };

  const updateInjectStatus = (id: string, status: InjectStatus) => {
    setState(s => ({
      ...s,
      injects: s.injects.map(inj => 
        inj.id === id 
          ? { ...inj, status, deployedAt: status === 'active' ? Date.now() : inj.deployedAt }
          : inj
      )
    }));
  };

  const startEditing = (id: string, title: string, content: string) => {
    setEditingInject(id);
    setDraftTitle(title);
    setDraftContent(content);
  };

  const saveInject = (id: string) => {
    if (!draftTitle.trim() || !draftContent.trim()) return;
    setState(s => ({
      ...s,
      injects: s.injects.map(inject => inject.id === id
        ? { ...inject, title: draftTitle.trim(), content: draftContent.trim() }
        : inject),
    }));
    setEditingInject(null);
  };

  const drawRandomEvent = () => {
    const pool = [
      { title: 'Backup Environment Responds', content: 'The backup environment is showing signs of access, but encryption has not begun.', type: 'public' as const },
      { title: 'Executive Escalation', content: 'A board member is asking whether customers need to be notified today.', type: 'private' as const, audience: 'Leadership' },
      { title: 'Vendor Account Confirmed', content: 'The suspicious activity is linked to a valid third-party vendor account.', type: 'public' as const },
    ];
    const selected = pool[Math.floor(Math.random() * pool.length)];
    setState(s => ({
      ...s,
      injects: [...s.injects, {
        id: `random-${Date.now()}`,
        title: selected.title,
        content: selected.content,
        type: selected.type,
        audience: selected.audience,
        status: 'pending',
      }],
    }));
  };

  const exportReport = () => {
    const released = state.injects.filter(inject => inject.status !== 'pending');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${state.scenarioTitle}</title><style>body{font-family:Arial,sans-serif;color:#172033;max-width:900px;margin:40px auto;line-height:1.5}h1{margin-bottom:4px}h2{border-bottom:2px solid #dce5ef;padding-bottom:8px;margin-top:32px}.meta{color:#566579}.item{border-left:4px solid #0b91c9;padding:10px 16px;margin:12px 0;background:#f3f7fa}.private{border-left-color:#e59a17}.small{font-size:12px;color:#64748b}</style></head><body><h1>${state.scenarioTitle}</h1><p class="meta">Exercise report · ${new Date().toLocaleString()} · ${state.phase}</p><h2>Objective</h2><p>${state.objective}</p><h2>Released information</h2>${released.map(inject => `<div class="item ${inject.type === 'private' ? 'private' : ''}"><strong>${inject.title}</strong><p>${inject.content}</p><div class="small">${inject.type.toUpperCase()} · ${inject.audience ?? 'Room'} · ${inject.deployedAt ? new Date(inject.deployedAt).toLocaleTimeString() : 'Recorded'}</div></div>`).join('') || '<p>No information released.</p>'}<h2>Hot wash</h2>${state.hotWash.map(item => `<div class="item"><strong>${item.team ?? 'Moderator'} · ${item.question ?? 'Observation'}</strong><p>${item.text}</p><div class="small">${new Date(item.timestamp).toLocaleTimeString()}</div></div>`).join('') || '<p>No hot wash entries.</p>'}<h2>Moderator notes</h2><p>${state.notes || 'No moderator notes recorded.'}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${state.scenarioTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const addHotWash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotWash.trim()) return;
    setState(s => ({
      ...s,
      hotWash: [...s.hotWash, { id: Date.now().toString(), text: newHotWash.trim(), timestamp: Date.now(), team: hotWashTeam, question: hotWashQuestion }]
    }));
    setNewHotWash('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-xl tracking-tight">CYBER COMMAND</h1>
          <Badge variant={state.status === 'running' ? 'success' : state.status === 'paused' ? 'warning' : 'secondary'} className="ml-4">
            {state.status.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 bg-muted px-4 py-2 rounded-md border border-border">
            <span className="font-mono text-2xl font-bold text-primary tracking-wider">{timer.formatted}</span>
            <div className="flex gap-2">
              {state.status !== 'running' ? (
                <Button size="icon" variant="secondary" onClick={handleStart} title="Start Exercise"><Play className="w-4 h-4 text-green-500" /></Button>
              ) : (
                <Button size="icon" variant="secondary" onClick={handlePause} title="Pause Exercise"><Pause className="w-4 h-4 text-warning" /></Button>
              )}
              <Button size="icon" variant="secondary" onClick={handleReset} title="Reset"><Square className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
          
          <Button asChild variant="outline" className="gap-2 border-primary/20 hover:border-primary/50">
            <a href="/display" target="_blank" rel="noopener noreferrer">
              <MonitorPlay className="w-4 h-4" />
              Room Display
            </a>
          </Button>
          <Button variant="outline" onClick={exportReport} className="gap-2">
            <FileDown className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left Column: Controls & Scenario */}
        <div className="col-span-3 flex flex-col gap-6 h-full">
          <Card className="flex-1 flex flex-col max-h-[62%] overflow-auto">
            <CardHeader>
              <CardTitle>Scenario Control</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Scenario</label>
                  <Input
                    value={state.scenarioTitle}
                    onChange={e => setState(s => ({ ...s, scenarioTitle: e.target.value }))}
                    className="font-display font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Exercise objective</label>
                  <Textarea
                    value={state.objective}
                    onChange={e => setState(s => ({ ...s, objective: e.target.value }))}
                    className="resize-none text-xs min-h-16"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Current Phase</label>
                <Input 
                  value={state.phase} 
                  onChange={e => setState(s => ({ ...s, phase: e.target.value }))}
                  className="font-sans font-medium"
                />
              </div>

              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Theatrical Effects</label>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant={state.effect === 'alarm' ? 'destructive' : 'outline'} 
                    className={state.effect === 'alarm' ? 'animate-pulse' : ''}
                    onClick={() => handleEffect(state.effect === 'alarm' ? 'none' : 'alarm')}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    RED ALERT
                  </Button>
                  <Button 
                    variant={state.effect === 'wrong-assumption' ? 'warning' : 'outline'}
                    onClick={() => handleEffect(state.effect === 'wrong-assumption' ? 'none' : 'wrong-assumption')}
                  >
                    WRONG ASSUMPTION
                  </Button>
                  {state.effect !== 'none' && (
                    <Button variant="ghost" size="sm" onClick={() => handleEffect('none')} className="text-muted-foreground mt-2">
                      Clear Effects
                    </Button>
                  )}
                  <Button variant="secondary" onClick={drawRandomEvent} className="w-full gap-2 font-mono">
                    <Shuffle className="w-4 h-4" />
                    DRAW RANDOM EVENT
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Moderator Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea 
                className="flex-1 resize-none font-mono text-sm" 
                placeholder="Private notes..."
                value={state.notes}
                onChange={e => setState(s => ({ ...s, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Injects */}
        <Card className="col-span-6 flex flex-col overflow-hidden">
          <CardHeader className="pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle>Master Inject Event List (MIEL)</CardTitle>
              <Badge variant="outline" className="font-mono">{state.injects.length} Total</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <Tabs defaultValue="pending" className="flex-1 flex flex-col h-full">
              <div className="px-6 pb-2 border-b border-border shrink-0">
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="active">Active ({state.injects.filter(i => i.status === 'active').length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full absolute inset-0">
                  <div className="px-6 py-4">
                    {['pending', 'active', 'completed'].map(tabStatus => (
                      <TabsContent key={tabStatus} value={tabStatus} className="m-0 flex flex-col gap-4">
                        {state.injects.filter(i => i.status === tabStatus).length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground text-sm font-mono border border-dashed border-border rounded-lg">
                            No {tabStatus} injects.
                          </div>
                        ) : (
                          state.injects.filter(i => i.status === tabStatus).map(inject => (
                            <Card key={inject.id} className={`border ${inject.status === 'active' ? 'border-primary' : 'border-border'}`}>
                              <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between space-y-0 border-b border-border">
                                <div className="flex items-center gap-3">
                                  <Badge variant={inject.type === 'public' ? 'default' : 'secondary'} className="h-6">
                                    {inject.type === 'public' ? <Eye className="w-3 h-3 mr-1"/> : <EyeOff className="w-3 h-3 mr-1"/>}
                                    {inject.type}
                                  </Badge>
                                  <CardTitle className="text-sm">{inject.title}</CardTitle>
                                </div>
                                {inject.status === 'active' && <Badge variant="warning" className="animate-pulse">DEPLOYED</Badge>}
                              </CardHeader>
                              <CardContent className="p-4 text-sm text-card-foreground leading-relaxed">
                                {editingInject === inject.id ? (
                                  <div className="space-y-3">
                                    <Input value={draftTitle} onChange={e => setDraftTitle(e.target.value)} />
                                    <Textarea value={draftContent} onChange={e => setDraftContent(e.target.value)} className="min-h-20 resize-none" />
                                    <div className="flex justify-end gap-2">
                                      <Button size="sm" variant="ghost" onClick={() => setEditingInject(null)}>Cancel</Button>
                                      <Button size="sm" onClick={() => saveInject(inject.id)} className="gap-2">
                                        <Save className="w-3 h-3" /> Save Changes
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between gap-4">
                                    <span>{inject.content}</span>
                                    {inject.status === 'pending' && (
                                      <Button size="icon" variant="ghost" title="Edit unreleased inject" onClick={() => startEditing(inject.id, inject.title, inject.content)}>
                                        <Edit3 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="py-3 px-4 bg-muted/10 border-t border-border flex justify-end gap-2">
                                {inject.status === 'pending' && (
                                  <Button size="sm" onClick={() => updateInjectStatus(inject.id, 'active')} className="gap-2 font-mono">
                                    <Send className="w-3 h-3"/> DEPLOY
                                  </Button>
                                )}
                                {inject.status === 'active' && (
                                  <Button size="sm" variant="outline" onClick={() => updateInjectStatus(inject.id, 'completed')} className="gap-2 font-mono hover:text-green-500 hover:border-green-500">
                                    <CheckCircle2 className="w-3 h-3"/> MARK RESOLVED
                                  </Button>
                                )}
                                {inject.status === 'completed' && (
                                  <Button size="sm" variant="ghost" onClick={() => updateInjectStatus(inject.id, 'active')} className="gap-2 font-mono text-muted-foreground">
                                    REDEPLOY
                                  </Button>
                                )}
                              </CardFooter>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Column: Hot Wash */}
        <Card className="col-span-3 flex flex-col overflow-hidden">
          <CardHeader className="shrink-0">
            <CardTitle>Live Hot Wash</CardTitle>
            <CardDescription>Capture observations for debrief</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 border rounded-md p-0 overflow-hidden relative mb-4">
              <ScrollArea className="h-full absolute inset-0">
                <div className="p-3">
                  {state.hotWash.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground font-mono">
                      No observations yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {state.hotWash.map(item => (
                        <div key={item.id} className="bg-muted p-3 rounded-md border border-border/50 text-sm">
                          <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase text-primary">
                            <Users className="w-3 h-3" />
                            {item.team ?? 'Moderator'} · {item.question ?? 'Observation'}
                          </div>
                          <p>{item.text}</p>
                          <div className="text-xs text-muted-foreground mt-2 font-mono flex items-center justify-between">
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <form onSubmit={addHotWash} className="flex flex-col gap-2 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <select value={hotWashTeam} onChange={e => setHotWashTeam(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                  {['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5'].map(team => <option key={team}>{team}</option>)}
                </select>
                <select value={hotWashQuestion} onChange={e => setHotWashQuestion(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                  {['Observation', 'What went well?', 'Missing information', 'Wrong assumption', 'Recommended action'].map(question => <option key={question}>{question}</option>)}
                </select>
              </div>
              <Textarea 
                value={newHotWash}
                onChange={e => setNewHotWash(e.target.value)}
                placeholder="Log observation..."
                className="h-20 resize-none text-sm"
              />
              <Button type="submit" className="w-full font-mono gap-2" disabled={!newHotWash.trim()}>
                <Plus className="w-4 h-4"/> ADD LOG
              </Button>
            </form>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
