<?php
require_once __DIR__ . '/db.php';

// Track visit (non-blocking)
try {
    $db  = getDb();
    $ip  = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
    $ua  = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);
    $db->prepare('INSERT INTO page_visits (ip_address, user_agent) VALUES (?,?)')->execute([$ip, $ua]);
    $subscriberCount = (int) $db->query('SELECT COUNT(*) FROM waitlist_entries')->fetchColumn();
} catch (Exception $e) {
    $subscriberCount = 0;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BibleSnap — Your Daily Bible Companion</title>
<meta name="description" content="BibleSnap is coming soon. Read the Bible, journal reflections, track your progress and grow deeper in your faith every day.">
<meta property="og:title" content="BibleSnap — Coming Soon">
<meta property="og:description" content="Your daily Bible companion. Read, study, journal and build a habit that transforms your faith.">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<style>
/* ═══════════════════════════════════════════════════════════════════════════════
   BASE
═══════════════════════════════════════════════════════════════════════════════ */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
    --p:    #8B5D33;
    --pl:   #A67C52;
    --pd:   #6A4424;
    --acc:  #4A6741;
    --gold: #C9A227;
    --bg:   #FBF7F0;
    --text: #2D2417;
    --t2:   #5A4A33;
    --t3:   #8B7355;
    --tl:   #F7F0E3;
    --bdr:  #E7DBC8;
    --hero: #150E05;
}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;color:var(--text);background:var(--bg);overflow-x:hidden}
img{max-width:100%;display:block}

/* ═══════════════════════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════════════════════ */
nav{
    position:fixed;top:0;width:100%;z-index:1000;
    padding:18px 48px;
    display:flex;align-items:center;justify-content:space-between;
    background:rgba(251,247,240,0.92);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border-bottom:1px solid var(--bdr);
    transition:all 0.4s ease;
}
nav.scrolled{
    background:rgba(251,247,240,0.98);
    padding:14px 48px;
    box-shadow:0 4px 24px rgba(45,36,23,0.08);
}
.nav-logo{
    display:flex;align-items:center;gap:10px;
    text-decoration:none;color:var(--text);
    font-family:'Playfair Display',serif;font-size:22px;font-weight:700;
}
.logo-icon{
    width:38px;height:38px;border-radius:11px;
    object-fit:cover;display:block;flex-shrink:0;
}
.nav-links{list-style:none;display:flex;align-items:center;gap:36px}
.nav-links a{
    color:var(--t2);text-decoration:none;
    font-size:14px;font-weight:400;transition:color 0.2s;
}
.nav-links a:hover{color:var(--text)}
.nav-cta{
    padding:10px 24px !important;
    background:linear-gradient(135deg,var(--gold),var(--pl)) !important;
    color:#fff !important;border-radius:50px !important;
    font-weight:600 !important;font-size:13px !important;
}
.nav-mobile-toggle{display:none;background:none;border:none;cursor:pointer;padding:4px}
.nav-mobile-toggle span{display:block;width:22px;height:2px;background:var(--tl);margin:4px 0;border-radius:2px;transition:all 0.3s}

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════════════════════ */
.hero{
    min-height:100vh;
    background:#FBF7F0;
    position:relative;display:flex;align-items:center;overflow:hidden;
}
#particles-canvas{display:none}
.hero-glow{display:none}
/* Decorative sparkle stars */
.sparkle{
    position:absolute;pointer-events:none;z-index:3;
    color:var(--gold);font-weight:300;line-height:1;
    animation:sparkle-twirl 10s linear infinite;
}
@keyframes sparkle-twirl{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}
/* Oval / ellipse decoration around phone */
.oval-ring{
    position:absolute;width:115%;height:90%;
    border:1.5px solid #DDD0BC;border-radius:50%;
    transform:rotate(-18deg);top:5%;left:-7%;
    pointer-events:none;z-index:0;
}
/* Coming-Soon chip pinned to phone top */
.coming-soon-chip{
    position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    z-index:10;
    background:#fff;border:1.5px solid #A8D5A2;
    border-radius:50px;padding:8px 20px 8px 14px;
    font-size:11px;font-weight:700;color:#2E7D32;letter-spacing:1px;text-transform:uppercase;
    box-shadow:0 4px 20px rgba(46,125,50,0.15);
    display:flex;align-items:center;gap:8px;white-space:nowrap;
    pointer-events:none;
}
.cs-dot{
    width:8px;height:8px;border-radius:50%;background:#43A047;flex-shrink:0;
    animation:dot-blink 1.8s ease-in-out infinite;
}
.hero-inner{
    position:relative;z-index:2;
    max-width:1280px;margin:0 auto;padding:130px 48px 100px;
    display:grid;grid-template-columns:1.1fr 0.9fr;gap:80px;align-items:center;
    width:100%;
}
/* Badge */
.hero-badge{
    display:inline-flex;align-items:center;gap:8px;
    background:#F0E8DC;
    border:1px solid #DDD0BC;
    color:#8B5D33;
    padding:7px 16px;border-radius:50px;
    font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
    margin-bottom:28px;
}
.badge-dot{
    width:6px;height:6px;border-radius:50%;background:var(--gold);
    animation:dot-blink 1.8s ease-in-out infinite;
}
@keyframes dot-blink{0%,100%{opacity:1}50%{opacity:0.25}}
/* Heading */
.hero-title{
    font-family:'Playfair Display',serif;
    font-size:clamp(44px,5.5vw,72px);font-weight:700;line-height:1.1;
    color:var(--text);margin-bottom:24px;
}
.hero-title .spark{font-size:0.55em;vertical-align:super;margin-left:4px;color:var(--gold)}
.hero-title .grad{
    -webkit-text-fill-color:var(--text);background:none;
    text-decoration:underline;
    text-decoration-color:var(--gold);
    text-decoration-thickness:3px;
    text-underline-offset:7px;
}
.hero-sub{
    font-size:17px;line-height:1.8;
    color:var(--t2);margin-bottom:36px;max-width:480px;
}
/* Form */
.waitlist-wrap{margin-bottom:20px}
.waitlist-form{display:flex;gap:0;max-width:480px;margin-bottom:10px;
    background:#fff;border:1.5px solid #D8D0C4;border-radius:14px;overflow:hidden;
    box-shadow:0 2px 16px rgba(45,36,23,0.06);
}
.w-input{
    flex:1;padding:16px 20px;
    border:none;border-right:none;
    border-radius:0;
    background:transparent;
    color:var(--text);font-size:15px;outline:none;
}
.w-input::placeholder{color:#B0A090}
.w-input:focus{background:transparent}
.w-btn{
    padding:14px 26px;white-space:nowrap;
    background:#2D2417;
    border:none;border-radius:10px;margin:4px;
    color:#fff;font-size:14px;font-weight:600;cursor:pointer;
    transition:opacity 0.2s,transform 0.1s;
}
.w-btn:hover{opacity:0.82}
.w-btn:active{transform:scale(0.98)}
.w-btn:disabled{opacity:0.5;cursor:not-allowed}
.form-msg{
    font-size:13px;padding:10px 15px;border-radius:9px;
    display:none;margin-top:4px;
}
.form-msg.ok{display:block;background:rgba(74,103,65,0.2);color:#7FC97A;border:1px solid rgba(74,103,65,0.35)}
.form-msg.err{display:block;background:rgba(244,67,54,0.12);color:#FF8A80;border:1px solid rgba(244,67,54,0.25)}
/* Store badges */
.store-badges{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.store-badge{
    display:flex;align-items:center;gap:10px;
    background:#2D2417;border-radius:12px;padding:10px 20px;
    text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;
    box-shadow:0 4px 14px rgba(45,36,23,0.18);
}
.store-badge:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,36,23,0.22)}
.store-badge-icon{font-size:24px;line-height:1}
.store-badge-texts{display:flex;flex-direction:column;gap:1px}
.store-badge-sub{font-size:10px;color:rgba(255,255,255,0.6);font-weight:400;line-height:1.2}
.store-badge-name{font-size:16px;color:#fff;font-weight:700;line-height:1.2}
/* Social proof */
.social-proof{display:flex;align-items:center;gap:14px;margin-top:20px}
.faces{display:flex}
.face{
    width:34px;height:34px;border-radius:50%;border:2px solid #F5F0E8;
    background:linear-gradient(135deg,var(--p),var(--acc));
    display:flex;align-items:center;justify-content:center;
    font-size:14px;margin-left:-9px;
}
.face:first-child{margin-left:0}
.proof-text{font-size:13px;color:var(--t2);line-height:1.4}
.proof-count{color:var(--p);font-weight:700;font-size:14px}

/* ═══════════════════════════════════════════════════════════════════════════════
   PHONE MOCKUP
═══════════════════════════════════════════════════════════════════════════════ */
.phone-wrap{display:flex;justify-content:center;align-items:center;position:relative;min-height:560px}
.phone-glow-ring{display:none}
.phone-float{animation:phone-float 7s ease-in-out infinite;position:relative;z-index:2}
@keyframes phone-float{
    0%,100%{transform:translateY(0) rotate(-1deg)}
    50%{transform:translateY(-18px) rotate(1deg)}
}
.phone{
    width:270px;
    background:#0A0A0A;
    border-radius:46px;
    border:10px solid #1E1E1E;
    box-shadow:
        0 0 0 1px #2E2E2E,
        0 40px 80px rgba(45,36,23,0.22),
        0 8px 24px rgba(45,36,23,0.12);
    overflow:hidden;position:relative;
}
.phone-notch{
    position:absolute;top:13px;left:50%;transform:translateX(-50%);
    width:88px;height:28px;background:#0A0A0A;
    border-radius:0 0 18px 18px;z-index:10;
}
.phone-screen{width:100%;aspect-ratio:9/19.5;overflow:hidden;position:relative}
/* Hero app screen simulation */
.screen-home{
    width:100%;height:100%;
    background:linear-gradient(180deg,#150E05 0%,#1F1108 60%,#150E05 100%);
    padding:44px 14px 14px;overflow:hidden;
}
.screen-home .s-greeting{font-size:9px;color:rgba(247,240,227,0.45);margin-bottom:12px}
.screen-home .s-title{font-family:'Playfair Display',serif;font-size:12px;color:var(--tl);margin-bottom:14px;font-weight:700}
.verse-card{
    background:rgba(247,240,227,0.07);
    border:1px solid rgba(247,240,227,0.12);
    border-radius:12px;padding:12px;margin-bottom:12px;
}
.verse-text{font-size:9px;color:#E8C547;font-style:italic;line-height:1.6;margin-bottom:6px}
.verse-ref{font-size:8px;color:rgba(247,240,227,0.4)}
.s-progress-label{font-size:9px;color:var(--tl);font-weight:600;margin-bottom:8px}
.s-bars{display:flex;gap:3px;align-items:flex-end;height:36px;margin-bottom:12px}
.s-bar{flex:1;border-radius:3px 3px 0 0;min-height:4px}
.challenge-card{
    background:linear-gradient(135deg,rgba(74,103,65,0.25),rgba(74,103,65,0.1));
    border:1px solid rgba(74,103,65,0.35);
    border-radius:10px;padding:10px;
}
.challenge-label{font-size:8px;color:rgba(247,240,227,0.5)}
.challenge-title{font-size:10px;color:var(--tl);font-weight:600;margin-top:3px}

/* Second phone (showcase) */
.showcase-phone{
    width:210px;background:#0A0A0A;
    border-radius:40px;border:8px solid #1E1E1E;
    box-shadow:0 0 0 1px #2E2E2E,0 30px 70px rgba(0,0,0,0.3);
    overflow:hidden;position:relative;
}
.showcase-phone::before{
    content:'';position:absolute;top:10px;left:50%;transform:translateX(-50%);
    width:68px;height:4px;background:#282828;border-radius:2px;z-index:10;
}
.showcase-phone .phone-screen{aspect-ratio:9/19.5}
/* Journal screen simulation */
.screen-journal{
    width:100%;height:100%;
    background:linear-gradient(180deg,#FBF7F0,#F3EBD8);
    padding:42px 12px 12px;overflow:hidden;
}
.j-header{font-family:'Playfair Display',serif;font-size:11px;color:var(--text);margin-bottom:12px;font-weight:700}
.j-card{
    background:#fff;border-radius:10px;padding:10px;
    margin-bottom:8px;border:1px solid #E7DBC8;
}
.j-date{font-size:7px;color:var(--t3);margin-bottom:3px}
.j-card-title{font-size:9px;font-weight:600;color:var(--text);margin-bottom:4px}
.j-card-text{font-size:8px;color:var(--t2);line-height:1.5}
.j-prayer{
    background:linear-gradient(135deg,#8B5D33,#A67C52);
    border-radius:10px;padding:10px;
}
.j-prayer .j-date{color:rgba(255,255,255,0.6)}
.j-prayer .j-card-title{color:#fff}
.j-prayer .j-card-text{color:rgba(255,255,255,0.7)}
/* Reader screen simulation */
.screen-reader{
    width:100%;height:100%;
    background:#1C1209;
    padding:44px 14px 14px;overflow:hidden;
}
.r-book{font-size:8px;color:var(--gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.r-chapter{font-family:'Playfair Display',serif;font-size:13px;color:var(--tl);margin-bottom:12px;font-weight:700}
.r-verse{
    font-size:9px;color:rgba(247,240,227,0.75);
    line-height:1.7;margin-bottom:8px;padding-left:8px;
    border-left:2px solid rgba(201,162,39,0.3);
}
.r-verse.highlighted{border-left-color:var(--gold);color:var(--tl)}
.r-toolbar{
    position:absolute;bottom:14px;left:14px;right:14px;
    display:flex;justify-content:space-around;
    background:rgba(247,240,227,0.06);border:1px solid rgba(247,240,227,0.1);
    border-radius:10px;padding:8px;
}
.r-tool{font-size:12px}

/* ═══════════════════════════════════════════════════════════════════════════════
   STATS BAR
═══════════════════════════════════════════════════════════════════════════════ */
.stats-bar{background:#fff;border-top:2px solid var(--bdr);border-bottom:1px solid var(--bdr)}
.stats-inner{
    max-width:1280px;margin:0 auto;padding:28px 48px;
    display:flex;justify-content:center;gap:80px;
}
.stat-item{text-align:center}
.stat-num{
    font-family:'Playfair Display',serif;font-size:36px;
    color:var(--p);font-weight:700;line-height:1;
}
.stat-lbl{font-size:12px;color:var(--t2);margin-top:4px;letter-spacing:0.5px}

/* ═══════════════════════════════════════════════════════════════════════════════
   SECTION COMMONS
═══════════════════════════════════════════════════════════════════════════════ */
.section{padding:110px 48px}
.s-inner{max-width:1280px;margin:0 auto}
.s-tag{
    font-size:11px;font-weight:700;letter-spacing:2.5px;
    text-transform:uppercase;color:var(--p);margin-bottom:14px;
}
.s-title{
    font-family:'Playfair Display',serif;
    font-size:clamp(30px,4vw,46px);font-weight:700;
    color:var(--text);margin-bottom:18px;line-height:1.15;
}
.s-sub{
    font-size:17px;color:var(--t2);max-width:560px;
    line-height:1.8;margin-bottom:64px;
}
/* Scroll-reveal */
.reveal{opacity:0;transform:translateY(36px);transition:opacity 0.75s ease,transform 0.75s ease}
.reveal.in{opacity:1;transform:none}

/* ═══════════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════════ */
.features-sec{background:#fff}
.features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.f-card{
    background:var(--bg);border:1px solid var(--bdr);border-radius:20px;
    padding:32px 24px;transition:transform 0.3s,box-shadow 0.3s;
}
.f-card:hover{transform:translateY(-8px);box-shadow:0 24px 60px rgba(139,93,51,0.1)}
.f-icon{
    width:54px;height:54px;border-radius:15px;
    display:flex;align-items:center;justify-content:center;
    font-size:24px;margin-bottom:22px;
}
.f-icon.br{background:linear-gradient(135deg,#8B5D33,#A67C52)}
.f-icon.go{background:linear-gradient(135deg,#C9A227,#E0B83A)}
.f-icon.gr{background:linear-gradient(135deg,#4A6741,#5E8054)}
.f-icon.dk{background:linear-gradient(135deg,#4A6741,#5E8054)}
.f-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:600;color:var(--text);margin-bottom:10px}
.f-desc{font-size:14px;color:var(--t2);line-height:1.75}

/* ═══════════════════════════════════════════════════════════════════════════════
   SCREENSHOTS
═══════════════════════════════════════════════════════════════════════════════ */
.screenshots-sec{background:#F0EBE0}
.showcase{display:flex;flex-direction:column;gap:20px;padding-bottom:80px}
.sc-row{
    display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;
    position:sticky;top:88px;z-index:1;
    background:#fff;border-radius:28px;padding:56px 60px;
    box-shadow:0 6px 40px rgba(45,36,23,0.08),0 0 0 1px rgba(231,219,200,0.6);
}
.sc-row:nth-child(2){z-index:2;background:#FBF7F0;top:98px}
.sc-row:nth-child(3){z-index:3;background:#F5EFE6;top:108px}
.sc-row.rev{direction:rtl}
.sc-row.rev>*{direction:ltr}
.sc-phone-wrap{display:flex;justify-content:center}
.sc-num{
    font-family:'Playfair Display',serif;font-size:80px;font-weight:700;
    color:var(--bdr);line-height:1;margin-bottom:14px;
}
.sc-tag{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--p);margin-bottom:10px}
.sc-title{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:var(--text);margin-bottom:14px;line-height:1.2}
.sc-desc{font-size:16px;color:var(--t2);line-height:1.8;margin-bottom:24px}
.sc-list{list-style:none;display:flex;flex-direction:column;gap:10px}
.sc-list li{
    display:flex;align-items:center;gap:10px;
    font-size:14px;color:var(--t2);
}
.sc-list li::before{
    content:'✓';width:22px;height:22px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,#4A6741,#5E8054);
    display:flex;align-items:center;justify-content:center;
    font-size:12px;color:#fff;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════════ */
.how-sec{background:linear-gradient(180deg,#F7F0E3 0%,#EDE3D0 100%)}
.how-sec .s-tag{color:var(--p)}
.how-sec .s-title{color:var(--text)}
.how-sec .s-sub{color:var(--t2)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;position:relative}
.steps::before{
    content:'';position:absolute;top:56px;
    left:calc(16.7% + 48px);right:calc(16.7% + 48px);
    height:1px;background:linear-gradient(90deg,transparent,var(--bdr),transparent);
}
.step{
    text-align:center;padding:44px 24px;
    background:#fff;
    border:1px solid var(--bdr);border-radius:22px;
    transition:transform 0.3s,box-shadow 0.3s,border-color 0.3s;
}
.step:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(139,93,51,0.1);border-color:var(--pl)}
.step-num{
    width:80px;height:80px;border-radius:50%;
    background:linear-gradient(135deg,#D4851E,var(--p));
    display:flex;align-items:center;justify-content:center;
    font-family:'Playfair Display',serif;font-size:30px;font-weight:700;
    color:#fff;margin:0 auto 24px;
    box-shadow:0 8px 24px rgba(212,133,30,0.3);
}
.step-icon{margin-bottom:18px;display:flex;justify-content:center}
.step-icon svg{stroke:var(--p)}
.step-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:600;color:var(--text);margin-bottom:12px}
.step-desc{font-size:14px;color:var(--t2);line-height:1.75}

/* ═══════════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════════════════════════════ */
.testi-sec{background:#fff}
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.testi-card{
    background:var(--bg);border:1px solid var(--bdr);
    border-radius:22px;padding:34px;
    transition:transform 0.3s,box-shadow 0.3s;
}
.testi-card:hover{transform:translateY(-4px);box-shadow:0 16px 50px rgba(139,93,51,0.08)}
.testi-stars{display:flex;gap:3px;margin-bottom:18px}
.star{color:var(--gold);font-size:17px}
.testi-text{
    font-size:15px;color:var(--t2);line-height:1.85;
    margin-bottom:28px;font-style:italic;
}
.testi-author{display:flex;align-items:center;gap:12px}
.author-av{
    width:46px;height:46px;border-radius:50%;
    background:linear-gradient(135deg,var(--p),var(--acc));
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-weight:700;font-size:18px;flex-shrink:0;
}
.author-name{font-weight:600;font-size:14px;color:var(--text)}
.author-role{font-size:12px;color:var(--t3);margin-top:2px}

/* ═══════════════════════════════════════════════════════════════════════════════
   CTA
═══════════════════════════════════════════════════════════════════════════════ */
.cta-sec{
    background:
        radial-gradient(ellipse at 85% 10%, rgba(255,200,100,0.22) 0%, transparent 50%),
        radial-gradient(ellipse at 10% 90%, rgba(80,30,0,0.25) 0%, transparent 50%),
        linear-gradient(135deg,#D4851E 0%,#A86828 40%,#8B5D33 100%);
    text-align:center;
}
.cta-sec .s-tag{color:rgba(255,255,255,0.75);letter-spacing:3px}
.cta-sec .s-title{color:#fff}
.cta-sec .s-sub{color:rgba(255,255,255,0.75);margin-left:auto;margin-right:auto}
.cta-form{display:flex;gap:0;max-width:460px;margin:0 auto 16px;background:rgba(255,255,255,0.18);border:1.5px solid rgba(255,255,255,0.35);border-radius:14px;overflow:hidden;backdrop-filter:blur(8px)}
.cta-form .w-input{color:#fff;border:none;background:transparent}
.cta-form .w-input::placeholder{color:rgba(255,255,255,0.55)}
.cta-form .w-btn{background:rgba(255,255,255,0.22);border:none;border-radius:10px;margin:4px;color:#fff;border:1px solid rgba(255,255,255,0.35)}
.cta-form .w-btn:hover{background:rgba(255,255,255,0.32)}
.cta-note{font-size:12px;color:rgba(255,255,255,0.45);margin-top:14px}

/* ═══════════════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════════════ */
footer{background:#1E1208;padding:64px 48px 44px}
.footer-inner{max-width:1280px;margin:0 auto}
.footer-top{
    display:grid;grid-template-columns:2fr 1fr;gap:64px;
    padding-bottom:44px;border-bottom:1px solid rgba(201,162,39,0.18);margin-bottom:44px;
}
.footer-top .nav-logo{color:#F7F0E3}
.footer-desc{font-size:14px;color:rgba(247,240,227,0.6);line-height:1.9;max-width:320px;margin-top:16px}
.footer-col-title{
    font-size:11px;font-weight:700;letter-spacing:2px;
    text-transform:uppercase;color:#C9A227;margin-bottom:18px;
}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:11px}
.footer-links a{
    color:rgba(247,240,227,0.55);text-decoration:none;
    font-size:14px;transition:color 0.2s;
}
.footer-links a:hover{color:#F7F0E3}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-copy,.footer-love{font-size:13px;color:rgba(247,240,227,0.4)}

/* ═══════════════════════════════════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════════════════════════════════ */
@media(max-width:1024px){
    .features-grid{grid-template-columns:repeat(2,1fr)}
    .hero-inner{gap:48px}
}
@media(max-width:860px){
    nav{padding:16px 24px}
    nav.scrolled{padding:12px 24px}
    .nav-links{display:none}
    .hero-inner{grid-template-columns:1fr;gap:48px;padding:110px 24px 80px}
    .phone-wrap{order:-1}
    .section{padding:80px 24px}
    .features-grid{grid-template-columns:1fr}
    .sc-row,.sc-row.rev{grid-template-columns:1fr;direction:ltr;gap:44px}
    .steps{grid-template-columns:1fr}
    .steps::before{display:none}
    .testi-grid{grid-template-columns:1fr}
    .stats-inner{gap:40px;flex-wrap:wrap;padding:24px}
    .footer-top{grid-template-columns:1fr 1fr;gap:32px}
}
@media(max-width:520px){
    .waitlist-form,.cta-form{flex-direction:column}
    .w-input{border-right:1px solid rgba(247,240,227,0.15);border-radius:12px}
    .w-btn{border-radius:12px}
    .cta-form .w-input,.cta-form .w-btn{border-radius:12px}
    .hero-title{font-size:30px!important}
    .hero-sub{font-size:14px}
    .s-title{font-size:24px!important}
    .sc-title{font-size:22px!important}
    .sc-row{padding:28px 20px;border-radius:18px}
    .step{padding:28px 16px}
    .section{padding:60px 16px}
    .store-badges{gap:8px}
    .store-badge{padding:8px 14px}
    .store-badge-name{font-size:14px}
    .features-grid{grid-template-columns:1fr}

    /* Testimonials: show only the first card, hide the rest */
    .testi-card:nth-child(n+2){display:none}
    .testi-sec .s-tag,.testi-sec .s-title{text-align:center}
    .testi-card{border-radius:18px}

    /* Footer: compact + centered */
    footer{padding:48px 20px 32px}
    .footer-top{grid-template-columns:1fr;gap:28px;text-align:center;padding-bottom:28px;margin-bottom:28px}
    .footer-desc{margin:12px auto 0;max-width:260px;font-size:13px}
    .nav-logo{justify-content:center}
    .footer-links{align-items:center}
    .footer-col-title{margin-bottom:12px}
    .footer-bottom{flex-direction:column;align-items:center;gap:6px;text-align:center}
}
</style>
</head>
<body>

<!-- ─── NAVBAR ──────────────────────────────────────────────────────────────── -->
<nav id="nav">
    <div class="coming-soon-chip">
        <span class="cs-dot"></span>
        Coming Soon
    </div>
    <a href="#" class="nav-logo">
        <img src="images/biblesnap-logo.png" class="logo-icon" alt="BibleSnap">
        BibleSnap
    </a>
    <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#screenshots">Screenshots</a></li>
        <li><a href="#how">How it works</a></li>
        <li><a href="#waitlist" class="nav-cta">Join the waitlist</a></li>
    </ul>
</nav>

<!-- ─── HERO ────────────────────────────────────────────────────────────────── -->
<section class="hero" id="hero">
    <canvas id="particles-canvas"></canvas>
    <div class="hero-glow"></div>

    <!-- Decorative sparkles -->
    <span class="sparkle" style="top:18%;left:52%;font-size:22px">✦</span>
    <span class="sparkle" style="top:72%;left:48%;font-size:14px;animation-duration:7s">✦</span>
    <span class="sparkle" style="top:30%;right:6%;font-size:18px;animation-duration:12s">✧</span>
    <span class="sparkle" style="top:60%;right:10%;font-size:11px;animation-duration:9s">✦</span>

    <div class="hero-inner">

        <!-- LEFT: text + form -->
        <div>
            <h1 class="hero-title">
                Grow Deeper<br>in <span class="grad">the Word</span><br>every day.
            </h1>

            <p class="hero-sub">
                BibleSnap is your daily Bible companion — read, study, journal your reflections, and build a spiritual habit that genuinely transforms your faith.
            </p>

            <div class="waitlist-wrap" id="hero-wrap">
                <form class="waitlist-form" id="hero-form">
                    <input class="w-input" type="email" id="hero-email" placeholder="Enter your email address…" required>
                    <button class="w-btn" type="submit" id="hero-btn">Get Started</button>
                </form>
                <div class="form-msg" id="hero-msg"></div>
            </div>

            <!-- App Store & Play Store badges -->
            <div class="store-badges">
                <a href="#waitlist" class="store-badge">
                    <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    <div class="store-badge-texts">
                        <span class="store-badge-sub">Download on the</span>
                        <span class="store-badge-name">App Store</span>
                    </div>
                </a>
                <a href="#waitlist" class="store-badge">
                    <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M3.18 23.76c.3.17.65.19.97.07l13.7-7.93-2.97-2.97-11.7 10.83zM.29 1.15C.11 1.49 0 1.9 0 2.37v19.26c0 .47.11.88.29 1.22l.07.06 10.79-10.79v-.25L.36 1.09l-.07.06zM21.4 10.37l-2.94-1.7-3.3 3.3 3.3 3.3 2.97-1.72c.85-.49.85-1.69-.03-2.18zM3.18.24L16.88 8.17l-2.97 2.97L3.18.31l.07-.07h-.07z"/></svg>
                    <div class="store-badge-texts">
                        <span class="store-badge-sub">Get it on</span>
                        <span class="store-badge-name">Google Play</span>
                    </div>
                </a>
            </div>

            <div class="social-proof">
                <div class="faces">
                    <div class="face" style="background:linear-gradient(135deg,#8B5D33,#A67C52)">A</div>
                    <div class="face" style="background:linear-gradient(135deg,#4A6741,#6A8A61)">J</div>
                    <div class="face" style="background:linear-gradient(135deg,#C9A227,#A67C52)">E</div>
                    <div class="face" style="background:linear-gradient(135deg,#6A4424,#8B5D33)">M</div>
                </div>
                <div class="proof-text">
                    <span class="proof-count" id="counter"><?= $subscriberCount ?></span>
                    believers already on the waitlist
                </div>
            </div>
        </div>

        <!-- RIGHT: phone (drop your screenshot in images/screen-home.png) -->
        <div class="phone-wrap">
            <div class="oval-ring"></div>
            <div class="phone-float">
                <div class="phone">
                    <div class="phone-notch"></div>
                    <div class="phone-screen">
                        <img src="images/biblesnap-homepage.jpeg" style="width:100%;height:100%;object-fit:cover;object-position:top" alt="BibleSnap home screen">
                    </div>
                </div>
            </div>
        </div>

    </div>
</section>

<!-- ─── STATS BAR ───────────────────────────────────────────────────────────── -->
<div class="stats-bar">
    <div class="stats-inner">
        <div class="stat-item">
            <div class="stat-num count-up" data-target="<?= $subscriberCount ?>"><?= $subscriberCount ?></div>
            <div class="stat-lbl">On the waitlist</div>
        </div>
        <div class="stat-item">
            <div class="stat-num">66</div>
            <div class="stat-lbl">Books of the Bible</div>
        </div>
        <div class="stat-item">
            <div class="stat-num">∞</div>
            <div class="stat-lbl">Faith to grow</div>
        </div>
    </div>
</div>

<!-- ─── FEATURES ────────────────────────────────────────────────────────────── -->
<section class="section features-sec" id="features">
    <div class="s-inner">
        <p class="s-tag reveal">Built for believers</p>
        <h2 class="s-title reveal">Everything you need to grow in faith</h2>
        <p class="s-sub reveal">Every feature is designed to help you build a consistent, meaningful relationship with Scripture — wherever you are in your walk.</p>

        <div class="features-grid">
            <div class="f-card reveal" style="transition-delay:.05s">
                <div class="f-icon br"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
                <h3 class="f-title">Read the Bible</h3>
                <p class="f-desc">Clean, distraction-free reader across all 66 books and multiple translations. Navigate by book, chapter, or verse instantly.</p>
            </div>
            <div class="f-card reveal" style="transition-delay:.15s">
                <div class="f-icon go"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></div>
                <h3 class="f-title">Daily Verse</h3>
                <p class="f-desc">Start every morning with a hand-curated scripture to anchor your heart. Save, share, and carry the Word with you all day.</p>
            </div>
            <div class="f-card reveal" style="transition-delay:.25s">
                <div class="f-icon gr"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
                <h3 class="f-title">Spiritual Journal</h3>
                <p class="f-desc">Write reflections, prayer intentions, and what God is teaching you. Your personal faith diary, beautifully organized.</p>
            </div>
            <div class="f-card reveal" style="transition-delay:.35s">
                <div class="f-icon dk"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <h3 class="f-title">Study Plans</h3>
                <p class="f-desc">Follow structured reading plans that fit your schedule. Track your streak, celebrate milestones, and stay accountable.</p>
            </div>
        </div>
    </div>
</section>

<!-- ─── SCREENSHOTS ─────────────────────────────────────────────────────────── -->
<section class="section screenshots-sec" id="screenshots">
    <div class="s-inner">
        <p class="s-tag reveal">See it in action</p>
        <h2 class="s-title reveal">Your faith journey, beautifully organized</h2>

        <div class="showcase">

            <!-- ROW 1: Home screen -->
            <div class="sc-row">
                <div class="sc-phone-wrap">
                    <div class="showcase-phone" style="width:230px">
                        <div class="phone-screen">
                            <img src="images/biblesnap-homepage.jpeg" style="width:100%;height:100%;object-fit:cover;object-position:top" alt="BibleSnap home screen">
                        </div>
                    </div>
                </div>
                <div>
                    <div class="sc-num">01</div>
                    <p class="sc-tag">Daily Dashboard</p>
                    <h3 class="sc-title">Your spiritual home, every morning</h3>
                    <p class="sc-desc">Wake up to your personalised verse of the day, check your weekly reading chart, and pick up your daily challenge — all in one glance.</p>
                    <ul class="sc-list">
                        <li>Daily verse & devotional</li>
                        <li>Weekly consistency chart</li>
                        <li>Personalised daily challenge</li>
                        <li>Study streak tracking</li>
                    </ul>
                </div>
            </div>

            <!-- ROW 2: Journal screen -->
            <div class="sc-row rev">
                <div class="sc-phone-wrap">
                    <div class="showcase-phone" style="width:230px">
                        <div class="phone-screen">
                            <img src="images/biblesnap-study.jpeg" style="width:100%;height:100%;object-fit:cover;object-position:top" alt="BibleSnap study screen">
                        </div>
                    </div>
                </div>
                <div>
                    <div class="sc-num">02</div>
                    <p class="sc-tag">Spiritual Journal</p>
                    <h3 class="sc-title">Capture what God is teaching you</h3>
                    <p class="sc-desc">Your personal faith diary. Write verse reflections, record answered prayers, and trace how God has been working in your life over months and years.</p>
                    <ul class="sc-list">
                        <li>Verse-linked reflections</li>
                        <li>Prayer wishlist & answered prayers</li>
                        <li>Categorised journal entries</li>
                        <li>Personal spiritual milestones</li>
                    </ul>
                </div>
            </div>

            <!-- ROW 3: Bible reader screen -->
            <div class="sc-row">
                <div class="sc-phone-wrap">
                    <div class="showcase-phone" style="width:230px">
                        <div class="phone-screen">
                            <img src="images/biblesnap-bible.jpeg" style="width:100%;height:100%;object-fit:cover;object-position:top" alt="BibleSnap Bible reader screen">
                        </div>
                    </div>
                </div>
                <div>
                    <div class="sc-num">03</div>
                    <p class="sc-tag">Bible Reader</p>
                    <h3 class="sc-title">Read Scripture with clarity &amp; focus</h3>
                    <p class="sc-desc">A clean, distraction-free reading experience across all books and translations. Highlight verses, save favourites, and add personal notes — all in one place.</p>
                    <ul class="sc-list">
                        <li>Multiple Bible translations</li>
                        <li>Highlight & save favourite verses</li>
                        <li>Seamless chapter navigation</li>
                        <li>Inline notes on any verse</li>
                    </ul>
                </div>
            </div>

        </div>
    </div>
</section>

<!-- ─── HOW IT WORKS ─────────────────────────────────────────────────────────── -->
<section class="section how-sec" id="how">
    <div class="s-inner">
        <p class="s-tag reveal">Simple by design</p>
        <h2 class="s-title reveal">Your daily rhythm in 3 steps</h2>
        <p class="s-sub reveal">BibleSnap fits seamlessly into your morning — no complicated setup, just open and grow.</p>

        <div class="steps">
            <div class="step reveal" style="transition-delay:.05s">
                <div class="step-num">1</div>
                <div class="step-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                <h3 class="step-title">Create your account</h3>
                <p class="step-desc">Sign up in seconds with email or Google. Choose your preferred Bible translation and set a daily reading goal that fits your schedule.</p>
            </div>
            <div class="step reveal" style="transition-delay:.2s">
                <div class="step-num">2</div>
                <div class="step-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div>
                <h3 class="step-title">Follow your plan</h3>
                <p class="step-desc">Pick a reading plan or go free-form. BibleSnap tracks your progress and sends gentle daily reminders to keep you consistent.</p>
            </div>
            <div class="step reveal" style="transition-delay:.35s">
                <div class="step-num">3</div>
                <div class="step-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg></div>
                <h3 class="step-title">Reflect &amp; journal</h3>
                <p class="step-desc">Write down what God is teaching you. Over time your journal becomes a beautiful record of your walk with Him — month by month, year by year.</p>
            </div>
        </div>
    </div>
</section>

<!-- ─── TESTIMONIALS ────────────────────────────────────────────────────────── -->
<section class="section testi-sec">
    <div class="s-inner">
        <p class="s-tag reveal">Community voices</p>
        <h2 class="s-title reveal">Loved by believers everywhere</h2>

        <div class="testi-grid">
            <div class="testi-card reveal" style="transition-delay:.05s">
                <div class="testi-stars"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div>
                <p class="testi-text">"BibleSnap completely changed my morning devotions. The journal feature alone is worth it — I can finally see how God has been at work in my life over the past year."</p>
                <div class="testi-author">
                    <div class="author-av">A</div>
                    <div>
                        <div class="author-name">Amara K.</div>
                        <div class="author-role">Daily devotion reader</div>
                    </div>
                </div>
            </div>
            <div class="testi-card reveal" style="transition-delay:.2s">
                <div class="testi-stars"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div>
                <p class="testi-text">"Finally an app that doesn't try to do too much. Clean, beautiful, and focused on what matters — staying in the Word every single day."</p>
                <div class="testi-author">
                    <div class="author-av">J</div>
                    <div>
                        <div class="author-name">James T.</div>
                        <div class="author-role">Bible study group leader</div>
                    </div>
                </div>
            </div>
            <div class="testi-card reveal" style="transition-delay:.35s">
                <div class="testi-stars"><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span></div>
                <p class="testi-text">"The daily verse and challenges keep me accountable. I've read more of the Bible in 3 months with BibleSnap than I did in the entire previous year."</p>
                <div class="testi-author">
                    <div class="author-av">E</div>
                    <div>
                        <div class="author-name">Esther M.</div>
                        <div class="author-role">New believer</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ─── CTA ─────────────────────────────────────────────────────────────────── -->
<section class="section cta-sec" id="waitlist">
    <div class="s-inner">
        <p class="s-tag">Be the first to know</p>
        <h2 class="s-title">Ready to grow in faith?</h2>
        <p class="s-sub">Join thousands of believers waiting for launch day. Get early access and updates delivered straight to your inbox — no spam, ever.</p>

        <form class="cta-form" id="cta-form">
            <input class="w-input" type="email" id="cta-email" placeholder="Your email address…" required>
            <button class="w-btn" type="submit" id="cta-btn">Join Waitlist</button>
        </form>
        <div class="form-msg" id="cta-msg"></div>
        <p class="cta-note">🔒 No spam, ever. Unsubscribe any time.</p>
    </div>
</section>

<!-- ─── FOOTER ───────────────────────────────────────────────────────────────── -->
<footer>
    <div class="footer-inner">
        <div class="footer-top">
            <div>
                <a href="#" class="nav-logo">
                    <img src="images/biblesnap-logo.png" class="logo-icon" alt="BibleSnap">
                    BibleSnap
                </a>
                <p class="footer-desc">Your daily Bible companion. Read, study, journal and build a habit that transforms your faith — one verse at a time.</p>
            </div>
            <div>
                <p class="footer-col-title">App</p>
                <ul class="footer-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#screenshots">Screenshots</a></li>
                    <li><a href="#how">How it works</a></li>
                    <li><a href="#waitlist">Join waitlist</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copy">© <?= date('Y') ?> BibleSnap. All rights reserved.</p>
            <p class="footer-love">Made with ✝️ for believers everywhere</p>
        </div>
    </div>
</footer>

<!-- ═══════════════════════════════════════════════════════════════════════════
     JAVASCRIPT
════════════════════════════════════════════════════════════════════════════ -->
<script>
// ── Golden particle canvas ────────────────────────────────────────────────────
(function(){
    const canvas = document.getElementById('particles-canvas');
    const ctx    = canvas.getContext('2d');
    let   W, H, particles = [];

    function resize(){
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class P {
        constructor(){ this.reset(true) }
        reset(rand){
            this.x    = Math.random() * W;
            this.y    = rand ? Math.random() * H : H + 6;
            this.r    = Math.random() * 2 + 0.5;
            this.vy   = Math.random() * 0.55 + 0.15;
            this.vx   = (Math.random() - 0.5) * 0.2;
            this.a    = Math.random() * 0.35 + 0.06;
            this.life = 0;
            this.max  = Math.random() * 220 + 80;
        }
        tick(){
            this.x   += this.vx + Math.sin(this.life * 0.025) * 0.35;
            this.y   -= this.vy;
            this.life++;
            if(this.y < -6 || this.life > this.max) this.reset(false);
        }
        draw(){
            const fade = 1 - this.life / this.max;
            ctx.save();
            ctx.globalAlpha = this.a * fade;
            ctx.fillStyle   = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }
    }

    for(let i=0;i<70;i++) particles.push(new P());

    (function loop(){
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p=>{ p.tick(); p.draw(); });
        requestAnimationFrame(loop);
    })();
})();

// ── Navbar scroll effect ──────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled', window.scrollY > 50);
},{passive:true});

// ── Scroll-reveal via IntersectionObserver ────────────────────────────────────
const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
},{threshold:0.1, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ── Count-up animation ────────────────────────────────────────────────────────
const countEl = document.querySelector('.count-up[data-target]');
if(countEl){
    const target  = parseInt(countEl.dataset.target)||0;
    const io2 = new IntersectionObserver(([e])=>{
        if(!e.isIntersecting) return;
        io2.disconnect();
        if(target === 0){ countEl.textContent='0'; return; }
        const dur = 1800, step = target/(dur/16);
        let cur = 0;
        const t = setInterval(()=>{
            cur = Math.min(cur+step, target);
            countEl.textContent = Math.floor(cur).toLocaleString();
            if(cur>=target) clearInterval(t);
        },16);
    },{threshold:0.5});
    io2.observe(countEl);
}

// ── Waitlist form handler ────────────────────────────────────────────────────
async function submitWaitlist(email, btn, msgEl, inputEl){
    btn.disabled = true;
    btn.textContent = 'Joining…';
    msgEl.className = 'form-msg';

    try{
        const res  = await fetch('api.php?action=join', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({action:'join', email})
        });
        const data = await res.json();

        if(data.success){
            msgEl.className = 'form-msg ok';
            msgEl.textContent = '🙏 You\'re on the list! We\'ll notify you on launch day.';
            if(inputEl) inputEl.value = '';
            // Update live counter
            const counterEl = document.getElementById('counter');
            if(counterEl && data.count) counterEl.textContent = data.count.toLocaleString();
        } else {
            msgEl.className = 'form-msg err';
            msgEl.textContent = data.message || 'Something went wrong. Please try again.';
        }
    } catch(_){
        msgEl.className = 'form-msg err';
        msgEl.textContent = 'Network error. Please check your connection and try again.';
    }

    btn.disabled = false;
    btn.textContent = btn.id==='hero-btn' ? 'Notify Me' : 'Join Waitlist';
}

document.getElementById('hero-form').addEventListener('submit',function(e){
    e.preventDefault();
    submitWaitlist(
        document.getElementById('hero-email').value,
        document.getElementById('hero-btn'),
        document.getElementById('hero-msg'),
        document.getElementById('hero-email')
    );
});

document.getElementById('cta-form').addEventListener('submit',function(e){
    e.preventDefault();
    submitWaitlist(
        document.getElementById('cta-email').value,
        document.getElementById('cta-btn'),
        document.getElementById('cta-msg'),
        document.getElementById('cta-email')
    );
});
</script>
</body>
</html>
