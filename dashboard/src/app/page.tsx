"use client"

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, LogIn, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#09090b] overflow-hidden">
      {/* Background Magical Aurora */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-float opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-float opacity-30" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-[0.2] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      <div className="z-10 w-full max-w-5xl px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Hero Text */}
        <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-[0.2em] uppercase">
              <Sparkles className="h-3 w-3" />
              SİHİRLİ DOKUNUŞ BAŞLIYOR
           </div>
           
           <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
             Frieren <br />
             <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">Dashboard</span>
           </h1>
           
           <p className="text-xl text-muted-foreground max-w-md mx-auto lg:mx-0 font-medium leading-relaxed italic">
             &quot;Binlerce yıllık tecrübe, şimdi sunucunuzda. Sihri kontrol altına alın.&quot;
           </p>

           <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
              <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                 <ShieldCheck className="h-5 w-5 text-primary" />
                 <span className="text-xs font-bold">Güçlü Koruma</span>
              </div>
              <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                 <Zap className="h-5 w-5 text-blue-500" />
                 <span className="text-xs font-bold">Işık Hızı</span>
              </div>
           </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <Card className="glass relative p-1 rounded-[3rem] overflow-visible border-none shadow-[0_0_100px_rgba(124,58,237,0.1)]">
            {/* Floating Decoration Icons */}
            <div className="absolute -top-6 -right-6 h-12 w-12 glass rounded-2xl flex items-center justify-center animate-float shadow-xl">
               <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute -bottom-6 -left-6 h-12 w-12 glass rounded-2xl flex items-center justify-center animate-float shadow-xl" style={{ animationDelay: '1s' }}>
               <Globe className="h-6 w-6 text-blue-500" />
            </div>

            <CardContent className="p-8 lg:p-12 space-y-8 flex flex-col items-center">
               <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                  <div className="h-24 w-24 glass rounded-3xl flex items-center justify-center border border-white/10 relative z-10">
                     <Bot className="h-12 w-12 text-primary" />
                  </div>
               </div>

               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black tracking-tight">Hoş Geldin</h2>
                  <p className="text-sm text-muted-foreground font-medium">Lütfen Discord hesabınla giriş yap</p>
               </div>

               <Button 
                size="lg"
                className="w-full h-14 text-lg font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(88,101,242,0.3)] flex items-center justify-center gap-3"
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
              >
                <LogIn className="h-6 w-6" />
                Discord ile Bağlan
              </Button>

              <div className="text-center p-4 border border-white/5 rounded-2xl bg-white/[0.02] w-full">
                 <p className="text-[10px] text-muted-foreground/60 leading-normal">
                   Giriş yaparak tüm kullanım koşullarını, gizlilik politikamızı ve veri işleme prosedürlerini kabul etmiş sayılırsınız.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.4em] uppercase text-white/20">
        POWERED BY FRIEREN MAGIC
      </div>
    </div>
  );
}
