// v2026-10-18
// Shared helpers for the invitation and the dashboard
(function(){
  var TZ = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.TIMEZONE) || "Africa/Cairo";
  var LOC = "ar-EG-u-nu-latn";

  function parts(date){
    var f = new Intl.DateTimeFormat("en-US", {timeZone: TZ, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false});
    var o = {}; f.formatToParts(date).forEach(function(p){ o[p.type] = p.value; });
    return {y:+o.year, m:+o.month, d:+o.day, h:(+o.hour)%24, min:+o.minute, s:+o.second};
  }
  // minutes that TZ is ahead of UTC at a given instant
  function offsetMin(date){
    var p = parts(date);
    var asUTC = Date.UTC(p.y, p.m-1, p.d, p.h, p.min, p.s);
    return Math.round((asUTC - Math.floor(date.getTime()/1000)*1000) / 60000);
  }
  // "2026-11-12T18:00" (wall time in TZ) -> Date
  function fromLocalInput(v){
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v || ""); if(!m) return null;
    var guess = Date.UTC(+m[1], +m[2]-1, +m[3], +m[4], +m[5]);
    var off = offsetMin(new Date(guess));
    var t = guess - off*60000;
    var off2 = offsetMin(new Date(t));
    if (off2 !== off) t = guess - off2*60000;
    return new Date(t);
  }
  function toLocalInput(date){
    var p = parts(date); function z(n){ return String(n).padStart(2,"0"); }
    return p.y + "-" + z(p.m) + "-" + z(p.d) + "T" + z(p.h) + ":" + z(p.min);
  }
  function fmt(date, opts){ return new Intl.DateTimeFormat(LOC, Object.assign({timeZone: TZ}, opts)).format(date); }

  // Fonts the couple can pick for their names (Google Fonts family, CSS stack, weight, letter-spacing, uppercase)
  var FONTS = [
    {id:"cormorant", label:"Cormorant", family:"Cormorant Garamond", q:"Cormorant+Garamond:wght@500", stack:"'Cormorant Garamond',serif", w:500, ls:".04em", up:false},
    {id:"playfair",  label:"Playfair",  family:"Playfair Display",   q:"Playfair+Display:wght@500",   stack:"'Playfair Display',serif",   w:500, ls:".01em", up:false},
    {id:"cinzel",    label:"Cinzel",    family:"Cinzel",             q:"Cinzel:wght@500",             stack:"'Cinzel',serif",             w:500, ls:".08em", up:true},
    {id:"marcellus", label:"Marcellus", family:"Marcellus",          q:"Marcellus",                   stack:"'Marcellus',serif",          w:400, ls:".06em", up:false},
    {id:"bodoni",    label:"Bodoni",    family:"Bodoni Moda",        q:"Bodoni+Moda:wght@500",        stack:"'Bodoni Moda',serif",        w:500, ls:".02em", up:false},
    {id:"italiana",  label:"Italiana",  family:"Italiana",           q:"Italiana",                    stack:"'Italiana',serif",           w:400, ls:".06em", up:false},
    {id:"josefin",   label:"Josefin",   family:"Josefin Sans",       q:"Josefin+Sans:wght@300",       stack:"'Josefin Sans',sans-serif",  w:300, ls:".14em", up:true},
    {id:"montserrat",label:"Montserrat",family:"Montserrat",         q:"Montserrat:wght@300",         stack:"'Montserrat',sans-serif",    w:300, ls:".16em", up:true},
    {id:"greatvibes",label:"Great Vibes (مزخرف)", family:"Great Vibes", q:"Great+Vibes",              stack:"'Great Vibes',cursive",      w:400, ls:"0",     up:false},
    {id:"pinyon",    label:"Pinyon (مزخرف)",      family:"Pinyon Script", q:"Pinyon+Script",          stack:"'Pinyon Script',cursive",    w:400, ls:"0",     up:false}
  ];
  function font(id){ for (var i=0;i<FONTS.length;i++) if (FONTS[i].id===id) return FONTS[i]; return FONTS[0]; }
  function loadFont(f){
    var idn = "font-" + f.id; if (document.getElementById(idn)) return;
    var l = document.createElement("link"); l.id = idn; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + f.q + "&display=swap"; document.head.appendChild(l);
  }
  // Extra settings live as one {type:"settings"} item inside the photos list
  function settings(inv){ var a = Array.isArray(inv && inv.photos) ? inv.photos : []; for (var i=0;i<a.length;i++) if (a[i] && a[i].type==="settings") return a[i]; return {type:"settings"}; }
  function photoList(inv){ return (Array.isArray(inv && inv.photos) ? inv.photos : []).filter(function(p){ return typeof p === "string" || (p && p.url); }).map(function(p){ return typeof p === "string" ? {url:p} : p; }); }

  window.WeddingUtil = {
    FONTS: FONTS, font: font, loadFont: loadFont, settings: settings, photoList: photoList,
    TZ: TZ, parts: parts, fromLocalInput: fromLocalInput, toLocalInput: toLocalInput,
    weekday: function(d){ return fmt(d, {weekday:"long"}); },
    monthName: function(d){ return fmt(d, {month:"long"}); },
    time: function(d){
      var p = parts(d); var h = p.h % 12 || 12;
      return h + ":" + String(p.min).padStart(2,"0") + (p.h < 12 ? " صباحًا" : " مساءً");
    },
    shortDate: function(d){ return fmt(d, {day:"numeric", month:"long", year:"numeric"}); },
    stamp: function(d){ return fmt(d, {day:"numeric", month:"short", hour:"numeric", minute:"2-digit"}); },
    gcalStamp: function(d){ return d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z"); },
    esc: function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); },
    safeUrl: function(u){ u = String(u||"").trim(); return /^https?:\/\//i.test(u) ? u : ""; },
    mapsSearch: function(q){ return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q); },
    client: function(){
      if (!window.supabase || !window.WEDDING_CONFIG) return null;
      return window.supabase.createClient(window.WEDDING_CONFIG.SUPABASE_URL, window.WEDDING_CONFIG.SUPABASE_KEY);
    }
  };
})();
