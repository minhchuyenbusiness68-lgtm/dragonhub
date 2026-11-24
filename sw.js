/* Dragon Hub service worker: only handles push notifications. No caching, no offline logic. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));

// The server sends an empty push. What to say is decided here from the date (Vietnam time, UTC+7).
self.addEventListener('push',e=>{
  const d=new Date(Date.now()+7*3600*1000);
  let mode='week',text='Weekly brief is ready';
  if(d.getUTCDate()===1){
    mode='month';text='Monthly brief is ready';
    if(d.getUTCMonth()===0){mode='year';text='Yearly brief is ready';}
  }
  e.waitUntil(self.registration.showNotification('Dragon Hub',{
    body:text+'. Open the app to read it.',
    tag:'brief',
    data:{mode:mode}
  }));
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const mode=(e.notification.data&&e.notification.data.mode)||'week';
  e.waitUntil((async()=>{
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of list){
      if('focus' in c){
        try{c.postMessage({brief:mode});}catch(_){}
        return c.focus();
      }
    }
    return self.clients.openWindow('./?brief='+mode);
  })());
});
