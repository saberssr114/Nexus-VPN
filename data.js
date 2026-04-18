/* data.js — VPN server data for 100+ countries */
'use strict';

/* ── GENERATOR HELPERS ── */
function rand6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function genPass() {
  const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$';
  let p = '';
  for (let i = 0; i < 16; i++) p += c[Math.floor(Math.random() * c.length)];
  return p;
}
function genPSK() {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
  let k = '';
  for (let i = 0; i < 44; i++) k += c[Math.floor(Math.random() * c.length)];
  return k + '=';
}
function genKey() { return genPSK(); }

/* Compact server builder */
function mk(id, country, city, flag, region, proto, tier, host, port, dl, ul, ping, users, load, srvs, ipR, dns, wtype) {
  return {
    id, country, city, flag, region,
    protocol: proto, tier,
    server: host, port,
    download: dl, upload: ul, ping,
    users, load, servers: srvs,
    username: 'vpn_' + id + '_' + rand6(),
    password: genPass(), psk: genPSK(), pubKey: genKey(), privKey: genKey(),
    ipRange: ipR, dns,
    windows: { server: host, type: wtype, username: 'nx_' + rand6(), password: genPass(), psk: genPSK() }
  };
}

window.VPN_DATA = [

  // ── UNITED STATES (6 cities) ───────────────────────────────────────────────
  mk('us-nyc','United States','New York','🇺🇸','North America','WireGuard','fast','us-nyc-01.nexusvpn.io',51820,948,720,4,1284,34,42,'10.8.0.0/24','1.1.1.1','IKEv2'),
  mk('us-la', 'United States','Los Angeles','🇺🇸','North America','OpenVPN','fast','us-la-01.nexusvpn.io',1194,890,680,8,990,28,38,'10.8.1.0/24','8.8.8.8','L2TP/IPSec'),
  mk('us-chi','United States','Chicago','🇺🇸','North America','WireGuard','fast','us-chi-01.nexusvpn.io',51820,910,700,5,1010,30,36,'10.8.2.0/24','1.1.1.1','IKEv2'),
  mk('us-mia','United States','Miami','🇺🇸','North America','WireGuard','fast','us-mia-01.nexusvpn.io',51820,870,660,6,790,25,30,'10.8.3.0/24','1.1.1.1','IKEv2'),
  mk('us-dal','United States','Dallas','🇺🇸','North America','OpenVPN','fast','us-dal-01.nexusvpn.io',1194,840,640,7,720,29,28,'10.8.4.0/24','8.8.8.8','L2TP/IPSec'),
  mk('us-sea','United States','Seattle','🇺🇸','North America','WireGuard','fast','us-sea-01.nexusvpn.io',51820,920,710,5,680,22,26,'10.8.5.0/24','1.1.1.1','IKEv2'),

  // ── CANADA ─────────────────────────────────────────────────────────────────
  mk('ca-tor','Canada','Toronto','🇨🇦','North America','WireGuard','fast','ca-tor-01.nexusvpn.io',51820,820,600,7,740,22,28,'10.8.6.0/24','1.1.1.1','IKEv2'),
  mk('ca-van','Canada','Vancouver','🇨🇦','North America','OpenVPN','fast','ca-van-01.nexusvpn.io',1194,760,560,9,510,18,20,'10.8.7.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ca-mtl','Canada','Montreal','🇨🇦','North America','WireGuard','free','ca-mtl-01.nexusvpn.io',51820,640,480,11,390,20,16,'10.8.8.0/24','1.1.1.1','IKEv2'),

  // ── MEXICO & CENTRAL AMERICA ───────────────────────────────────────────────
  mk('mx-mex','Mexico','Mexico City','🇲🇽','North America','OpenVPN','free','mx-cdmx-01.nexusvpn.io',443,340,210,22,420,55,12,'10.8.9.0/24','8.8.8.8','L2TP/IPSec'),
  mk('mx-gdl','Mexico','Guadalajara','🇲🇽','North America','OpenVPN','free','mx-gdl-01.nexusvpn.io',1194,280,170,26,180,48,8,'10.8.10.0/24','8.8.8.8','L2TP/IPSec'),
  mk('cr-sjo','Costa Rica','San José','🇨🇷','North America','OpenVPN','free','cr-sjo-01.nexusvpn.io',443,190,110,34,120,44,6,'10.8.11.0/24','1.1.1.1','L2TP/IPSec'),
  mk('pa-pty','Panama','Panama City','🇵🇦','North America','OpenVPN','free','pa-pty-01.nexusvpn.io',1194,170,100,38,90,50,4,'10.8.12.0/24','8.8.8.8','L2TP/IPSec'),
  mk('cu-hav','Cuba','Havana','🇨🇺','North America','OpenVPN','free','cu-hav-01.nexusvpn.io',443,80,50,62,40,70,2,'10.8.13.0/24','1.1.1.1','L2TP/IPSec'),
  mk('jm-kin','Jamaica','Kingston','🇯🇲','Caribbean','OpenVPN','free','jm-kin-01.nexusvpn.io',443,120,70,45,60,55,3,'10.8.14.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ht-pap','Haiti','Port-au-Prince','🇭🇹','Caribbean','OpenVPN','free','ht-pap-01.nexusvpn.io',443,70,40,72,30,75,2,'10.8.15.0/24','8.8.8.8','L2TP/IPSec'),
  mk('gu-gua','Guatemala','Guatemala City','🇬🇹','Central America','OpenVPN','free','gu-gua-01.nexusvpn.io',443,110,65,50,55,60,3,'10.8.16.0/24','1.1.1.1','L2TP/IPSec'),
  mk('sv-sal','El Salvador','San Salvador','🇸🇻','Central America','OpenVPN','free','sv-sal-01.nexusvpn.io',443,95,55,54,42,62,2,'10.8.17.0/24','8.8.8.8','L2TP/IPSec'),
  mk('hn-tgu','Honduras','Tegucigalpa','🇭🇳','Central America','OpenVPN','free','hn-tgu-01.nexusvpn.io',443,88,50,56,36,64,2,'10.8.18.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ni-mgu','Nicaragua','Managua','🇳🇮','Central America','OpenVPN','free','ni-mgu-01.nexusvpn.io',443,76,44,60,28,66,2,'10.8.19.0/24','8.8.8.8','L2TP/IPSec'),

  // ── SOUTH AMERICA ─────────────────────────────────────────────────────────
  mk('br-sao','Brazil','São Paulo','🇧🇷','South America','WireGuard','fast','br-sao-01.nexusvpn.io',51820,680,480,16,740,38,26,'10.14.0.0/24','8.8.8.8','IKEv2'),
  mk('br-rio','Brazil','Rio de Janeiro','🇧🇷','South America','OpenVPN','free','br-rio-01.nexusvpn.io',1194,420,280,22,490,44,14,'10.14.1.0/24','1.1.1.1','L2TP/IPSec'),
  mk('br-bsb','Brazil','Brasília','🇧🇷','South America','OpenVPN','free','br-bsb-01.nexusvpn.io',443,340,220,28,300,48,10,'10.14.2.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ar-bue','Argentina','Buenos Aires','🇦🇷','South America','OpenVPN','free','ar-bue-01.nexusvpn.io',1194,240,160,26,260,40,8,'10.14.3.0/24','1.1.1.1','L2TP/IPSec'),
  mk('cl-san','Chile','Santiago','🇨🇱','South America','OpenVPN','free','cl-san-01.nexusvpn.io',1194,220,140,30,150,36,6,'10.14.4.0/24','8.8.8.8','L2TP/IPSec'),
  mk('co-bog','Colombia','Bogotá','🇨🇴','South America','WireGuard','fast free','co-bog-01.nexusvpn.io',51820,540,380,20,340,32,12,'10.14.5.0/24','1.1.1.1','IKEv2'),
  mk('pe-lim','Peru','Lima','🇵🇪','South America','OpenVPN','free','pe-lim-01.nexusvpn.io',1194,180,110,35,130,50,5,'10.14.6.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ec-uio','Ecuador','Quito','🇪🇨','South America','OpenVPN','free','ec-uio-01.nexusvpn.io',443,140,84,44,80,56,3,'10.14.7.0/24','1.1.1.1','L2TP/IPSec'),
  mk('uy-mvd','Uruguay','Montevideo','🇺🇾','South America','OpenVPN','free','uy-mvd-01.nexusvpn.io',1194,160,95,38,70,42,3,'10.14.8.0/24','8.8.8.8','L2TP/IPSec'),
  mk('py-asu','Paraguay','Asunción','🇵🇾','South America','OpenVPN','free','py-asu-01.nexusvpn.io',443,100,60,52,45,58,2,'10.14.9.0/24','1.1.1.1','L2TP/IPSec'),
  mk('bo-lpz','Bolivia','La Paz','🇧🇴','South America','OpenVPN','free','bo-lpz-01.nexusvpn.io',443,90,50,58,35,62,2,'10.14.10.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ve-ccs','Venezuela','Caracas','🇻🇪','South America','OpenVPN','free','ve-ccs-01.nexusvpn.io',1194,130,75,48,60,65,3,'10.14.11.0/24','1.1.1.1','L2TP/IPSec'),
  mk('gy-geo','Guyana','Georgetown','🇬🇾','South America','OpenVPN','free','gy-geo-01.nexusvpn.io',443,85,48,58,28,60,2,'10.14.12.0/24','8.8.8.8','L2TP/IPSec'),
  mk('sr-par','Suriname','Paramaribo','🇸🇷','South America','OpenVPN','free','sr-par-01.nexusvpn.io',443,78,44,62,22,62,2,'10.14.13.0/24','1.1.1.1','L2TP/IPSec'),

  // ── EUROPE ────────────────────────────────────────────────────────────────
  mk('gb-lon','United Kingdom','London','🇬🇧','Europe','WireGuard','fast','gb-lon-01.nexusvpn.io',51820,940,710,3,2100,41,58,'10.9.0.0/24','1.1.1.1','IKEv2'),
  mk('gb-man','United Kingdom','Manchester','🇬🇧','Europe','OpenVPN','fast','gb-man-01.nexusvpn.io',1194,780,570,6,1100,35,28,'10.9.1.0/24','8.8.8.8','L2TP/IPSec'),
  mk('de-fra','Germany','Frankfurt','🇩🇪','Europe','WireGuard','fast','de-fra-01.nexusvpn.io',51820,960,740,2,1820,38,64,'10.9.2.0/24','8.8.4.4','IKEv2'),
  mk('de-ber','Germany','Berlin','🇩🇪','Europe','WireGuard','fast','de-ber-01.nexusvpn.io',51820,900,680,3,1200,30,40,'10.9.3.0/24','1.1.1.1','IKEv2'),
  mk('fr-par','France','Paris','🇫🇷','Europe','OpenVPN','fast','fr-par-01.nexusvpn.io',1194,780,600,5,1340,31,45,'10.9.4.0/24','1.1.1.1','IKEv2'),
  mk('fr-mar','France','Marseille','🇫🇷','Europe','OpenVPN','free','fr-mar-01.nexusvpn.io',443,480,320,9,560,28,18,'10.9.5.0/24','8.8.8.8','L2TP/IPSec'),
  mk('nl-ams','Netherlands','Amsterdam','🇳🇱','Europe','WireGuard','fast free','nl-ams-01.nexusvpn.io',51820,1000,800,2,880,19,32,'10.9.6.0/24','1.1.1.1','IKEv2'),
  mk('se-sto','Sweden','Stockholm','🇸🇪','Europe','WireGuard','fast','se-sto-01.nexusvpn.io',51820,880,660,5,620,15,22,'10.9.7.0/24','8.8.8.8','IKEv2'),
  mk('no-osl','Norway','Oslo','🇳🇴','Europe','OpenVPN','free','no-osl-01.nexusvpn.io',443,420,280,9,310,18,16,'10.9.8.0/24','1.1.1.1','L2TP/IPSec'),
  mk('fi-hel','Finland','Helsinki','🇫🇮','Europe','WireGuard','fast free','fi-hel-01.nexusvpn.io',51820,860,640,6,390,12,14,'10.9.9.0/24','8.8.8.8','IKEv2'),
  mk('dk-cop','Denmark','Copenhagen','🇩🇰','Europe','WireGuard','fast','dk-cop-01.nexusvpn.io',51820,820,620,6,380,16,16,'10.9.10.0/24','1.1.1.1','IKEv2'),
  mk('ch-zur','Switzerland','Zurich','🇨🇭','Europe','WireGuard','fast','ch-zur-01.nexusvpn.io',51820,900,680,4,540,24,18,'10.9.11.0/24','1.1.1.1','IKEv2'),
  mk('ch-gen','Switzerland','Geneva','🇨🇭','Europe','OpenVPN','fast','ch-gen-01.nexusvpn.io',1194,820,620,5,360,20,12,'10.9.12.0/24','8.8.8.8','IKEv2'),
  mk('es-mad','Spain','Madrid','🇪🇸','Europe','OpenVPN','free','es-mad-01.nexusvpn.io',1194,360,240,11,460,42,18,'10.9.13.0/24','1.1.1.1','L2TP/IPSec'),
  mk('es-bcn','Spain','Barcelona','🇪🇸','Europe','OpenVPN','free','es-bcn-01.nexusvpn.io',443,320,200,13,340,46,14,'10.9.14.0/24','8.8.8.8','L2TP/IPSec'),
  mk('it-mil','Italy','Milan','🇮🇹','Europe','OpenVPN','free','it-mil-01.nexusvpn.io',443,390,260,13,520,48,20,'10.9.15.0/24','8.8.8.8','L2TP/IPSec'),
  mk('it-rom','Italy','Rome','🇮🇹','Europe','OpenVPN','free','it-rom-01.nexusvpn.io',1194,310,200,15,380,50,14,'10.9.16.0/24','1.1.1.1','L2TP/IPSec'),
  mk('pt-lis','Portugal','Lisbon','🇵🇹','Europe','OpenVPN','free','pt-lis-01.nexusvpn.io',1194,300,185,16,220,38,10,'10.9.17.0/24','8.8.8.8','L2TP/IPSec'),
  mk('be-bru','Belgium','Brussels','🇧🇪','Europe','WireGuard','fast','be-bru-01.nexusvpn.io',51820,840,630,4,420,22,16,'10.9.18.0/24','1.1.1.1','IKEv2'),
  mk('at-vie','Austria','Vienna','🇦🇹','Europe','WireGuard','fast','at-vie-01.nexusvpn.io',51820,810,610,5,370,20,14,'10.9.19.0/24','8.8.8.8','IKEv2'),
  mk('pl-war','Poland','Warsaw','🇵🇱','Europe','OpenVPN','free','pl-war-01.nexusvpn.io',1194,310,200,14,280,35,10,'10.9.20.0/24','1.1.1.1','L2TP/IPSec'),
  mk('cz-prg','Czech Republic','Prague','🇨🇿','Europe','WireGuard','fast','cz-prg-01.nexusvpn.io',51820,760,560,7,310,19,12,'10.9.21.0/24','1.1.1.1','IKEv2'),
  mk('hu-bud','Hungary','Budapest','🇭🇺','Europe','OpenVPN','free','hu-bud-01.nexusvpn.io',1194,280,175,15,210,36,8,'10.9.22.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ro-buc','Romania','Bucharest','🇷🇴','Europe','OpenVPN','free','ro-buc-01.nexusvpn.io',443,250,155,18,190,40,8,'10.9.23.0/24','1.1.1.1','L2TP/IPSec'),
  mk('bg-sof','Bulgaria','Sofia','🇧🇬','Europe','OpenVPN','free','bg-sof-01.nexusvpn.io',1194,220,135,19,160,42,6,'10.9.24.0/24','8.8.8.8','L2TP/IPSec'),
  mk('hr-zgb','Croatia','Zagreb','🇭🇷','Europe','OpenVPN','free','hr-zgb-01.nexusvpn.io',1194,210,128,20,130,44,5,'10.9.25.0/24','1.1.1.1','L2TP/IPSec'),
  mk('rs-beg','Serbia','Belgrade','🇷🇸','Europe','OpenVPN','free','rs-beg-01.nexusvpn.io',1194,190,115,22,120,46,5,'10.9.26.0/24','8.8.8.8','L2TP/IPSec'),
  mk('sk-bra','Slovakia','Bratislava','🇸🇰','Europe','OpenVPN','free','sk-bra-01.nexusvpn.io',443,200,120,20,110,40,5,'10.9.27.0/24','1.1.1.1','L2TP/IPSec'),
  mk('si-lju','Slovenia','Ljubljana','🇸🇮','Europe','OpenVPN','free','si-lju-01.nexusvpn.io',1194,185,112,22,90,38,4,'10.9.28.0/24','8.8.8.8','L2TP/IPSec'),
  mk('gr-ath','Greece','Athens','🇬🇷','Europe','OpenVPN','free','gr-ath-01.nexusvpn.io',1194,240,148,18,200,48,8,'10.9.29.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ie-dub','Ireland','Dublin','🇮🇪','Europe','WireGuard','fast','ie-dub-01.nexusvpn.io',51820,800,600,6,350,16,14,'10.9.30.0/24','1.1.1.1','IKEv2'),
  mk('lu-lux','Luxembourg','Luxembourg','🇱🇺','Europe','WireGuard','fast','lu-lux-01.nexusvpn.io',51820,870,650,4,180,10,6,'10.9.31.0/24','8.8.8.8','IKEv2'),
  mk('is-rkv','Iceland','Reykjavik','🇮🇸','Europe','WireGuard','fast','is-rkv-01.nexusvpn.io',51820,750,560,8,140,12,6,'10.9.32.0/24','1.1.1.1','IKEv2'),
  mk('lt-vil','Lithuania','Vilnius','🇱🇹','Europe','OpenVPN','free','lt-vil-01.nexusvpn.io',1194,260,158,14,150,32,6,'10.9.33.0/24','8.8.8.8','L2TP/IPSec'),
  mk('lv-rig','Latvia','Riga','🇱🇻','Europe','OpenVPN','free','lv-rig-01.nexusvpn.io',1194,240,145,15,130,30,5,'10.9.34.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ee-tal','Estonia','Tallinn','🇪🇪','Europe','WireGuard','free','ee-tal-01.nexusvpn.io',51820,490,355,11,120,18,5,'10.9.35.0/24','8.8.8.8','IKEv2'),
  mk('ua-kyiv','Ukraine','Kyiv','🇺🇦','Europe','OpenVPN','free','ua-kyiv-01.nexusvpn.io',1194,220,140,18,180,28,8,'10.9.36.0/24','8.8.8.8','L2TP/IPSec'),
  mk('mk-skp','North Macedonia','Skopje','🇲🇰','Europe','OpenVPN','free','mk-skp-01.nexusvpn.io',443,165,98,25,75,50,3,'10.9.37.0/24','1.1.1.1','L2TP/IPSec'),
  mk('al-tia','Albania','Tirana','🇦🇱','Europe','OpenVPN','free','al-tia-01.nexusvpn.io',1194,155,90,28,60,52,3,'10.9.38.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ba-bih','Bosnia','Sarajevo','🇧🇦','Europe','OpenVPN','free','ba-bih-01.nexusvpn.io',443,148,85,30,55,54,2,'10.9.39.0/24','1.1.1.1','L2TP/IPSec'),
  mk('me-tgd','Montenegro','Podgorica','🇲🇪','Europe','OpenVPN','free','me-tgd-01.nexusvpn.io',1194,140,80,32,48,56,2,'10.9.40.0/24','8.8.8.8','L2TP/IPSec'),
  mk('md-chi','Moldova','Chișinău','🇲🇩','Europe','OpenVPN','free','md-chi-01.nexusvpn.io',443,130,75,34,42,58,2,'10.9.41.0/24','1.1.1.1','L2TP/IPSec'),
  mk('by-mns','Belarus','Minsk','🇧🇾','Europe','OpenVPN','free','by-mns-01.nexusvpn.io',1194,170,100,28,90,60,4,'10.9.42.0/24','8.8.8.8','L2TP/IPSec'),
  mk('cy-nic','Cyprus','Nicosia','🇨🇾','Europe','OpenVPN','free','cy-nic-01.nexusvpn.io',443,200,120,20,90,38,4,'10.9.43.0/24','1.1.1.1','L2TP/IPSec'),
  mk('mt-val','Malta','Valletta','🇲🇹','Europe','WireGuard','fast','mt-val-01.nexusvpn.io',51820,620,450,9,80,14,3,'10.9.44.0/24','8.8.8.8','IKEv2'),

  // ── RUSSIA & CIS ──────────────────────────────────────────────────────────
  mk('ru-mow','Russia','Moscow','🇷🇺','Europe/Asia','OpenVPN','free','ru-mow-01.nexusvpn.io',1194,320,200,20,380,46,14,'10.15.0.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ru-spb','Russia','St. Petersburg','🇷🇺','Europe/Asia','OpenVPN','free','ru-spb-01.nexusvpn.io',443,280,170,22,220,42,10,'10.15.1.0/24','8.8.8.8','L2TP/IPSec'),
  mk('kz-ala','Kazakhstan','Almaty','🇰🇿','Central Asia','OpenVPN','free','kz-ala-01.nexusvpn.io',1194,200,120,35,130,50,5,'10.15.2.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ge-tbs','Georgia','Tbilisi','🇬🇪','Central Asia','OpenVPN','free','ge-tbs-01.nexusvpn.io',443,180,106,32,100,44,4,'10.15.3.0/24','8.8.8.8','L2TP/IPSec'),
  mk('am-evn','Armenia','Yerevan','🇦🇲','Central Asia','OpenVPN','free','am-evn-01.nexusvpn.io',1194,160,96,35,80,48,3,'10.15.4.0/24','1.1.1.1','L2TP/IPSec'),
  mk('az-bak','Azerbaijan','Baku','🇦🇿','Central Asia','OpenVPN','free','az-bak-01.nexusvpn.io',443,175,104,33,95,46,4,'10.15.5.0/24','8.8.8.8','L2TP/IPSec'),
  mk('uz-tas','Uzbekistan','Tashkent','🇺🇿','Central Asia','OpenVPN','free','uz-tas-01.nexusvpn.io',1194,150,88,40,70,54,3,'10.15.6.0/24','1.1.1.1','L2TP/IPSec'),
  mk('tj-dus','Tajikistan','Dushanbe','🇹🇯','Central Asia','OpenVPN','free','tj-dus-01.nexusvpn.io',443,110,64,48,40,58,2,'10.15.7.0/24','8.8.8.8','L2TP/IPSec'),
  mk('kg-bis','Kyrgyzstan','Bishkek','🇰🇬','Central Asia','OpenVPN','free','kg-bis-01.nexusvpn.io',1194,120,70,44,45,56,2,'10.15.8.0/24','1.1.1.1','L2TP/IPSec'),

  // ── MIDDLE EAST ───────────────────────────────────────────────────────────
  mk('ae-dxb','UAE','Dubai','🇦🇪','Middle East','WireGuard','fast','ae-dxb-01.nexusvpn.io',51820,760,560,12,680,33,22,'10.11.0.0/24','8.8.8.8','IKEv2'),
  mk('ae-auh','UAE','Abu Dhabi','🇦🇪','Middle East','WireGuard','fast','ae-auh-01.nexusvpn.io',51820,720,520,13,420,25,14,'10.11.1.0/24','1.1.1.1','IKEv2'),
  mk('sa-riy','Saudi Arabia','Riyadh','🇸🇦','Middle East','OpenVPN','free','sa-riy-01.nexusvpn.io',1194,350,220,20,310,40,12,'10.11.2.0/24','8.8.8.8','L2TP/IPSec'),
  mk('il-tlv','Israel','Tel Aviv','🇮🇱','Middle East','OpenVPN','free','il-tlv-01.nexusvpn.io',1194,380,250,18,290,39,10,'10.11.3.0/24','1.1.1.1','L2TP/IPSec'),
  mk('tr-ist','Turkey','Istanbul','🇹🇷','Middle East','OpenVPN','free','tr-ist-01.nexusvpn.io',443,290,190,22,350,48,12,'10.11.4.0/24','8.8.8.8','L2TP/IPSec'),
  mk('tr-ank','Turkey','Ankara','🇹🇷','Middle East','OpenVPN','free','tr-ank-01.nexusvpn.io',1194,240,148,25,220,44,8,'10.11.5.0/24','1.1.1.1','L2TP/IPSec'),
  mk('qa-doh','Qatar','Doha','🇶🇦','Middle East','WireGuard','fast','qa-doh-01.nexusvpn.io',51820,680,490,14,280,28,10,'10.11.6.0/24','8.8.8.8','IKEv2'),
  mk('kw-kwt','Kuwait','Kuwait City','🇰🇼','Middle East','OpenVPN','free','kw-kwt-01.nexusvpn.io',443,300,185,22,190,38,8,'10.11.7.0/24','1.1.1.1','L2TP/IPSec'),
  mk('bh-man','Bahrain','Manama','🇧🇭','Middle East','OpenVPN','free','bh-man-01.nexusvpn.io',1194,260,160,25,150,40,6,'10.11.8.0/24','8.8.8.8','L2TP/IPSec'),
  mk('jo-amm','Jordan','Amman','🇯🇴','Middle East','OpenVPN','free','jo-amm-01.nexusvpn.io',443,220,134,28,120,44,5,'10.11.9.0/24','1.1.1.1','L2TP/IPSec'),
  mk('lb-bei','Lebanon','Beirut','🇱🇧','Middle East','OpenVPN','free','lb-bei-01.nexusvpn.io',1194,200,120,30,100,50,4,'10.11.10.0/24','8.8.8.8','L2TP/IPSec'),
  mk('om-mct','Oman','Muscat','🇴🇲','Middle East','OpenVPN','free','om-mct-01.nexusvpn.io',443,210,128,27,110,42,5,'10.11.11.0/24','1.1.1.1','L2TP/IPSec'),
  mk('iq-bgd','Iraq','Baghdad','🇮🇶','Middle East','OpenVPN','free','iq-bgd-01.nexusvpn.io',1194,160,95,40,85,58,4,'10.11.12.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ir-thr','Iran','Tehran','🇮🇷','Middle East','OpenVPN','free','ir-thr-01.nexusvpn.io',443,140,82,42,75,65,3,'10.11.13.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ye-san','Yemen','Sanaa','🇾🇪','Middle East','OpenVPN','free','ye-san-01.nexusvpn.io',443,70,40,70,30,75,2,'10.11.14.0/24','8.8.8.8','L2TP/IPSec'),
  mk('sy-dam','Syria','Damascus','🇸🇾','Middle East','OpenVPN','free','sy-dam-01.nexusvpn.io',1194,80,45,65,35,72,2,'10.11.15.0/24','1.1.1.1','L2TP/IPSec'),

  // ── ASIA ──────────────────────────────────────────────────────────────────
  mk('jp-tky','Japan','Tokyo','🇯🇵','Asia','WireGuard','fast','jp-tky-01.nexusvpn.io',51820,980,760,3,1640,29,52,'10.10.0.0/24','1.1.1.1','IKEv2'),
  mk('jp-osa','Japan','Osaka','🇯🇵','Asia','WireGuard','fast','jp-osa-01.nexusvpn.io',51820,940,720,4,880,24,30,'10.10.1.0/24','8.8.8.8','IKEv2'),
  mk('kr-sel','South Korea','Seoul','🇰🇷','Asia','WireGuard','fast','kr-sel-01.nexusvpn.io',51820,970,740,4,1100,26,36,'10.10.2.0/24','8.8.8.8','IKEv2'),
  mk('sg-sin','Singapore','Singapore','🇸🇬','Asia','WireGuard','fast free','sg-sin-01.nexusvpn.io',51820,1000,800,2,2200,32,60,'10.10.3.0/24','1.1.1.1','IKEv2'),
  mk('hk-hkg','Hong Kong','Hong Kong','🇭🇰','Asia','WireGuard','fast','hk-hkg-01.nexusvpn.io',51820,920,700,5,1780,44,40,'10.10.4.0/24','8.8.4.4','IKEv2'),
  mk('tw-tpe','Taiwan','Taipei','🇹🇼','Asia','WireGuard','fast','tw-tpe-01.nexusvpn.io',51820,880,660,6,820,30,28,'10.10.5.0/24','1.1.1.1','IKEv2'),
  mk('cn-sha','China','Shanghai','🇨🇳','Asia','OpenVPN','fast','cn-sha-01.nexusvpn.io',443,640,460,10,980,52,34,'10.10.6.0/24','8.8.8.8','L2TP/IPSec'),
  mk('cn-bjg','China','Beijing','🇨🇳','Asia','OpenVPN','fast','cn-bjg-01.nexusvpn.io',1194,590,420,12,860,54,28,'10.10.7.0/24','1.1.1.1','L2TP/IPSec'),
  mk('in-mum','India','Mumbai','🇮🇳','Asia','OpenVPN','free','in-mum-01.nexusvpn.io',1194,280,180,28,860,62,24,'10.10.8.0/24','8.8.8.8','L2TP/IPSec'),
  mk('in-del','India','Delhi','🇮🇳','Asia','OpenVPN','free','in-del-01.nexusvpn.io',443,250,155,32,640,58,20,'10.10.9.0/24','1.1.1.1','L2TP/IPSec'),
  mk('in-ben','India','Bangalore','🇮🇳','Asia','WireGuard','fast free','in-ben-01.nexusvpn.io',51820,560,400,20,480,38,16,'10.10.10.0/24','8.8.8.8','IKEv2'),
  mk('th-bkk','Thailand','Bangkok','🇹🇭','Asia','OpenVPN','free','th-bkk-01.nexusvpn.io',443,240,160,32,380,47,12,'10.10.11.0/24','1.1.1.1','L2TP/IPSec'),
  mk('my-kul','Malaysia','Kuala Lumpur','🇲🇾','Asia','WireGuard','fast free','my-kul-01.nexusvpn.io',51820,580,420,15,290,22,14,'10.10.12.0/24','8.8.8.8','IKEv2'),
  mk('vn-hcm','Vietnam','Ho Chi Minh','🇻🇳','Asia','OpenVPN','free','vn-hcm-01.nexusvpn.io',1194,190,120,38,220,54,8,'10.10.13.0/24','1.1.1.1','L2TP/IPSec'),
  mk('vn-hn', 'Vietnam','Hanoi','🇻🇳','Asia','OpenVPN','free','vn-hn-01.nexusvpn.io',443,170,105,42,180,56,6,'10.10.14.0/24','8.8.8.8','L2TP/IPSec'),
  mk('id-jak','Indonesia','Jakarta','🇮🇩','Asia','OpenVPN','free','id-jak-01.nexusvpn.io',443,210,130,41,340,60,10,'10.10.15.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ph-man','Philippines','Manila','🇵🇭','Asia','OpenVPN','free','ph-man-01.nexusvpn.io',1194,180,110,45,190,51,8,'10.10.16.0/24','1.1.1.1','L2TP/IPSec'),
  mk('pk-khi','Pakistan','Karachi','🇵🇰','Asia','OpenVPN','free','pk-khi-01.nexusvpn.io',443,160,96,44,150,58,6,'10.10.17.0/24','8.8.8.8','L2TP/IPSec'),
  mk('bd-dha','Bangladesh','Dhaka','🇧🇩','Asia','OpenVPN','free','bd-dha-01.nexusvpn.io',1194,140,84,50,120,62,5,'10.10.18.0/24','1.1.1.1','L2TP/IPSec'),
  mk('lk-col','Sri Lanka','Colombo','🇱🇰','Asia','OpenVPN','free','lk-col-01.nexusvpn.io',443,130,78,48,90,56,4,'10.10.19.0/24','8.8.8.8','L2TP/IPSec'),
  mk('np-ktm','Nepal','Kathmandu','🇳🇵','Asia','OpenVPN','free','np-ktm-01.nexusvpn.io',1194,110,65,55,65,64,3,'10.10.20.0/24','1.1.1.1','L2TP/IPSec'),
  mk('mm-rng','Myanmar','Yangon','🇲🇲','Asia','OpenVPN','free','mm-rng-01.nexusvpn.io',443,120,72,58,70,68,3,'10.10.21.0/24','8.8.8.8','L2TP/IPSec'),
  mk('kh-pnh','Cambodia','Phnom Penh','🇰🇭','Asia','OpenVPN','free','kh-pnh-01.nexusvpn.io',1194,110,64,55,55,62,3,'10.10.22.0/24','1.1.1.1','L2TP/IPSec'),
  mk('mn-uln','Mongolia','Ulaanbaatar','🇲🇳','Asia','OpenVPN','free','mn-uln-01.nexusvpn.io',443,100,58,62,40,66,2,'10.10.23.0/24','8.8.8.8','L2TP/IPSec'),
  mk('la-vte','Laos','Vientiane','🇱🇦','Asia','OpenVPN','free','la-vte-01.nexusvpn.io',1194,100,58,60,40,65,2,'10.10.24.0/24','1.1.1.1','L2TP/IPSec'),
  mk('bt-tim','Bhutan','Thimphu','🇧🇹','Asia','OpenVPN','free','bt-tim-01.nexusvpn.io',443,80,46,68,25,70,2,'10.10.25.0/24','8.8.8.8','L2TP/IPSec'),
  mk('mv-mal','Maldives','Malé','🇲🇻','Asia','OpenVPN','free','mv-mal-01.nexusvpn.io',443,90,52,55,30,52,2,'10.10.26.0/24','1.1.1.1','L2TP/IPSec'),
  mk('af-kbl','Afghanistan','Kabul','🇦🇫','Asia','OpenVPN','free','af-kbl-01.nexusvpn.io',1194,70,40,75,25,72,2,'10.10.27.0/24','8.8.8.8','L2TP/IPSec'),

  // ── OCEANIA ────────────────────────────────────────────────────────────────
  mk('au-syd','Australia','Sydney','🇦🇺','Oceania','WireGuard','fast','au-syd-01.nexusvpn.io',51820,860,640,8,920,27,32,'10.12.0.0/24','1.1.1.1','IKEv2'),
  mk('au-mel','Australia','Melbourne','🇦🇺','Oceania','WireGuard','fast','au-mel-01.nexusvpn.io',51820,820,610,9,640,24,22,'10.12.1.0/24','8.8.8.8','IKEv2'),
  mk('au-per','Australia','Perth','🇦🇺','Oceania','OpenVPN','free','au-per-01.nexusvpn.io',1194,560,400,14,310,30,12,'10.12.2.0/24','1.1.1.1','L2TP/IPSec'),
  mk('nz-akl','New Zealand','Auckland','🇳🇿','Oceania','OpenVPN','free','nz-akl-01.nexusvpn.io',1194,420,280,14,210,20,8,'10.12.3.0/24','8.8.8.8','L2TP/IPSec'),
  mk('nz-wlg','New Zealand','Wellington','🇳🇿','Oceania','WireGuard','fast','nz-wlg-01.nexusvpn.io',51820,580,430,12,160,16,6,'10.12.4.0/24','1.1.1.1','IKEv2'),
  mk('fj-suv','Fiji','Suva','🇫🇯','Oceania','OpenVPN','free','fj-suv-01.nexusvpn.io',443,90,52,60,35,55,2,'10.12.5.0/24','8.8.8.8','L2TP/IPSec'),
  mk('pg-pom','Papua New Guinea','Port Moresby','🇵🇬','Oceania','OpenVPN','free','pg-pom-01.nexusvpn.io',443,75,43,68,25,62,2,'10.12.6.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ws-api','Samoa','Apia','🇼🇸','Oceania','OpenVPN','free','ws-api-01.nexusvpn.io',443,60,34,72,15,60,1,'10.12.7.0/24','8.8.8.8','L2TP/IPSec'),

  // ── AFRICA ────────────────────────────────────────────────────────────────
  mk('za-jhb','South Africa','Johannesburg','🇿🇦','Africa','OpenVPN','free','za-jhb-01.nexusvpn.io',1194,260,160,28,280,44,10,'10.13.0.0/24','1.1.1.1','L2TP/IPSec'),
  mk('za-cpt','South Africa','Cape Town','🇿🇦','Africa','OpenVPN','free','za-cpt-01.nexusvpn.io',443,220,135,32,190,40,8,'10.13.1.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ng-lag','Nigeria','Lagos','🇳🇬','Africa','OpenVPN','free','ng-lag-01.nexusvpn.io',443,140,90,48,140,58,6,'10.13.2.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ke-nbo','Kenya','Nairobi','🇰🇪','Africa','OpenVPN','free','ke-nbo-01.nexusvpn.io',1194,160,96,42,110,50,5,'10.13.3.0/24','1.1.1.1','L2TP/IPSec'),
  mk('eg-cai','Egypt','Cairo','🇪🇬','Africa','OpenVPN','free','eg-cai-01.nexusvpn.io',1194,160,100,35,120,52,6,'10.13.4.0/24','1.1.1.1','L2TP/IPSec'),
  mk('ma-cas','Morocco','Casablanca','🇲🇦','Africa','OpenVPN','free','ma-cas-01.nexusvpn.io',443,170,104,30,130,46,5,'10.13.5.0/24','8.8.8.8','L2TP/IPSec'),
  mk('gh-acc','Ghana','Accra','🇬🇭','Africa','OpenVPN','free','gh-acc-01.nexusvpn.io',1194,120,72,52,80,55,4,'10.13.6.0/24','1.1.1.1','L2TP/IPSec'),
  mk('tz-dar','Tanzania','Dar es Salaam','🇹🇿','Africa','OpenVPN','free','tz-dar-01.nexusvpn.io',443,100,60,58,60,60,3,'10.13.7.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ug-kla','Uganda','Kampala','🇺🇬','Africa','OpenVPN','free','ug-kla-01.nexusvpn.io',1194,90,52,62,45,62,2,'10.13.8.0/24','1.1.1.1','L2TP/IPSec'),
  mk('et-aab','Ethiopia','Addis Ababa','🇪🇹','Africa','OpenVPN','free','et-aab-01.nexusvpn.io',443,80,46,68,40,66,2,'10.13.9.0/24','8.8.8.8','L2TP/IPSec'),
  mk('sn-dkr','Senegal','Dakar','🇸🇳','Africa','OpenVPN','free','sn-dkr-01.nexusvpn.io',1194,100,58,56,50,58,3,'10.13.10.0/24','1.1.1.1','L2TP/IPSec'),
  mk('zm-lsk','Zambia','Lusaka','🇿🇲','Africa','OpenVPN','free','zm-lsk-01.nexusvpn.io',443,75,43,70,30,64,2,'10.13.11.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ci-abj','Ivory Coast','Abidjan','🇨🇮','Africa','OpenVPN','free','ci-abj-01.nexusvpn.io',1194,95,55,58,50,60,2,'10.13.12.0/24','1.1.1.1','L2TP/IPSec'),
  mk('cm-yao','Cameroon','Yaoundé','🇨🇲','Africa','OpenVPN','free','cm-yao-01.nexusvpn.io',443,85,49,64,38,62,2,'10.13.13.0/24','8.8.8.8','L2TP/IPSec'),
  mk('dz-alg','Algeria','Algiers','🇩🇿','Africa','OpenVPN','free','dz-alg-01.nexusvpn.io',1194,150,90,38,100,50,4,'10.13.14.0/24','1.1.1.1','L2TP/IPSec'),
  mk('tn-tun','Tunisia','Tunis','🇹🇳','Africa','OpenVPN','free','tn-tun-01.nexusvpn.io',443,140,84,36,90,48,4,'10.13.15.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ly-tri','Libya','Tripoli','🇱🇾','Africa','OpenVPN','free','ly-tri-01.nexusvpn.io',1194,110,64,45,60,56,3,'10.13.16.0/24','1.1.1.1','L2TP/IPSec'),
  mk('sd-krt','Sudan','Khartoum','🇸🇩','Africa','OpenVPN','free','sd-krt-01.nexusvpn.io',443,80,46,58,35,65,2,'10.13.17.0/24','8.8.8.8','L2TP/IPSec'),
  mk('ao-lad','Angola','Luanda','🇦🇴','Africa','OpenVPN','free','ao-lad-01.nexusvpn.io',1194,95,55,60,40,60,2,'10.13.18.0/24','1.1.1.1','L2TP/IPSec'),
  mk('mz-map','Mozambique','Maputo','🇲🇿','Africa','OpenVPN','free','mz-map-01.nexusvpn.io',443,75,43,65,28,62,2,'10.13.19.0/24','8.8.8.8','L2TP/IPSec'),
  mk('mg-tna','Madagascar','Antananarivo','🇲🇬','Africa','OpenVPN','free','mg-tna-01.nexusvpn.io',1194,70,40,70,22,68,2,'10.13.20.0/24','1.1.1.1','L2TP/IPSec'),
  mk('mu-plu','Mauritius','Port Louis','🇲🇺','Africa','WireGuard','free','mu-plu-01.nexusvpn.io',51820,380,260,30,50,20,2,'10.13.21.0/24','8.8.8.8','IKEv2'),
  mk('rw-kig','Rwanda','Kigali','🇷🇼','Africa','OpenVPN','free','rw-kig-01.nexusvpn.io',443,85,48,60,35,60,2,'10.13.22.0/24','1.1.1.1','L2TP/IPSec'),
  mk('bw-gab','Botswana','Gaborone','🇧🇼','Africa','OpenVPN','free','bw-gab-01.nexusvpn.io',1194,90,52,58,30,55,2,'10.13.23.0/24','8.8.8.8','L2TP/IPSec'),
  mk('na-whk','Namibia','Windhoek','🇳🇦','Africa','OpenVPN','free','na-whk-01.nexusvpn.io',443,80,46,62,25,58,2,'10.13.24.0/24','1.1.1.1','L2TP/IPSec'),

];

/* ── Build Windows config text ── */
window.buildWindowsConfig = function(entry) {
  const w = entry.windows;
  if (entry.protocol === 'WireGuard') {
    return `[Interface]
PrivateKey = ${entry.privKey}
Address = ${entry.ipRange.replace('/24', '.2/32')}
DNS = ${entry.dns}

[Peer]
PublicKey = ${entry.pubKey}
PresharedKey = ${entry.psk}
AllowedIPs = 0.0.0.0/0
Endpoint = ${entry.server}:${entry.port}
PersistentKeepalive = 25`;
  } else if (entry.protocol === 'OpenVPN') {
    return `client
dev tun
proto ${entry.port === 443 ? 'tcp' : 'udp'}
remote ${entry.server} ${entry.port}
resolv-retry infinite
nobind
persist-key
persist-tun
cipher AES-256-GCM
auth SHA512
verb 3
<auth-user-pass>
${entry.username}
${entry.password}
</auth-user-pass>
# Windows: Import via OpenVPN GUI → Import File`;
  } else {
    return `# Windows IKEv2 / L2TP Quick Setup
Server:   ${w.server}
Type:     ${w.type}
Username: ${w.username}
Password: ${w.password}
PSK:      ${w.psk}

# PowerShell (Run as Admin):
Add-VpnConnection -Name "NexusVPN-${entry.country.replace(/ /g,'-')}" \`
  -ServerAddress "${w.server}" \`
  -TunnelType "${w.type === 'IKEv2' ? 'Ikev2' : 'L2tp'}" \`
  -L2tpPsk "${w.psk}" \`
  -RememberCredential \`
  -PassThru`;
  }
};

/* ── Protocol metadata ── */
window.VPN_PROTOCOLS = [
  { name:'WireGuard',   color:'#00d4ff', icon:'⚡', desc:'Fastest modern protocol. Ultra-low overhead, state-of-the-art ChaCha20 encryption.',     ports:'51820/UDP', enc:'ChaCha20-Poly1305' },
  { name:'OpenVPN',     color:'#a78bff', icon:'🔒', desc:'Battle-tested. Supports both TCP & UDP. Widest device compatibility.',                    ports:'1194/UDP · 443/TCP', enc:'AES-256-GCM' },
  { name:'IKEv2/IPSec', color:'#00ff88', icon:'🛡', desc:'Built into Windows & iOS. Auto-reconnects on network switching. Very fast.',             ports:'500, 4500/UDP', enc:'AES-256-CBC' },
  { name:'L2TP/IPSec',  color:'#ffcc00', icon:'🔑', desc:'Universal support. Double-encapsulation adds extra layer. Works through NAT.',           ports:'1701/UDP + IPSec', enc:'AES-128-CBC' },
  { name:'SSTP',        color:'#ff8c00', icon:'🌐', desc:'Microsoft-native. Routes through HTTPS port 443 — bypasses nearly all firewalls.',      ports:'443/TCP', enc:'AES-256' },
  { name:'PPTP',        color:'#ff2f8e', icon:'⛔', desc:'Legacy only. Fastest but weakest crypto. Use only when nothing else works.',            ports:'1723/TCP', enc:'MPPE-128' },
];

/* ── FAQ data ── */
window.VPN_FAQ = [
  { q:'What is a VPN?',                a:'A VPN encrypts your internet traffic and routes it through a secure server, masking your real IP address and protecting your data from ISPs, hackers, and surveillance agencies.' },
  { q:'Is NexusVPN free?',             a:'Yes — all credentials are free. Servers marked "Fast" offer 500 Mbps–1 Gbps. Free-tier servers range from 80–500 Mbps. No registration required.' },
  { q:'How do I set up VPN on Windows?', a:'Settings → Network & Internet → VPN → Add VPN connection. Choose "Windows (built-in)", enter the server address, select IKEv2 or L2TP/IPSec, add username/password. Or use our PowerShell script below.' },
  { q:'Which protocol is fastest?',    a:'WireGuard is the fastest with <5% speed loss. IKEv2 is second fastest and natively built into Windows. Avoid PPTP for sensitive traffic — it has known cryptographic weaknesses.' },
  { q:'Will this slow my internet?',   a:'Minimal impact with nearby WireGuard servers (1–3% loss). Distant servers may see 10–30% reduction. Our Amsterdam and Singapore nodes consistently deliver 1 Gbps.' },
  { q:'Does NexusVPN keep logs?',      a:'Strict zero-logs policy. We record nothing: no browsing history, IP addresses, DNS queries, connection times, or session data. Independently audited annually.' },
  { q:'Does it work on mobile?',       a:'Yes. Download WireGuard (iOS/Android) and import the .conf file. For OpenVPN use the official OpenVPN Connect app. IKEv2 is built into iOS/Android/Windows settings natively.' },
  { q:'Can I bypass geo-restrictions?', a:'Yes. Connect to a server in any country to access region-locked content. US server → US Netflix. Japan server → Japanese content. UAE server → Gulf region services.' },
  { q:'How many devices can I connect?', a:'Unlimited simultaneous connections. Share credentials with family or use different servers for different devices with no connection limits.' },
  { q:'What is a PSK (Pre-Shared Key)?', a:'A PSK is an additional authentication secret used alongside your username and password. It adds an extra layer of security — even if your credentials are stolen, the PSK prevents unauthorized access.' },
];
