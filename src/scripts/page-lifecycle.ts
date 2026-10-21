import {setupVideoScenes} from './video-scene';
import {setupSceneDock} from './scene-dock';
import {setupSiteUI} from './ui';
import {setupThemePreference} from './theme-preference';
import {setupJournalArchive} from './journal-archive';
import {setupJournalReader} from './journal-reader';
import {setupPageTransitions} from './page-transitions';

setupThemePreference();
setupPageTransitions();

// Also mount when a deferred module arrives after the initial page-load event.
// The body guard avoids binding controls twice on the same document.
let mountedBody:HTMLElement|null=null;
function mountPage(){
  if(!document.body||mountedBody===document.body)return;
  const controller=new AbortController();
  document.addEventListener('astro:before-swap',()=>{controller.abort();mountedBody=null;},{once:true,signal:controller.signal});
  // Reading and retrieval mount independently of the decorative scene controls.
  setupJournalArchive(controller.signal);
  setupJournalReader(controller.signal);
  mountedBody=document.body;
  setupVideoScenes();
  setupSceneDock();
  setupSiteUI();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountPage,{once:true});
else mountPage();
document.addEventListener('astro:page-load',mountPage);
