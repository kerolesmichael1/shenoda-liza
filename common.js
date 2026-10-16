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

  window.WeddingUtil = {
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
