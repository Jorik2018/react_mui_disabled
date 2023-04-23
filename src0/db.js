import Dexie from 'dexie';

import { http } from 'gra-react-utils';

export const db = new Dexie('minsa');
db.version(3).stores({
  disabled: '++id', // Primary key and indexed props
  region:'code',
  province:'code',
  district:'code',
  red:'code',
  microred:'code'
});
let loader={
  red:"/api/grds/red/0/0",
  microred:"/api/grds/microred/0/0",
  region:"/admin/directory/api/region/0/0",
  province:"/admin/directory/api/province/0/0",
  district:"/admin/directory/api/district/0/0"
}
export function retrieve(store,setter,force){
  db[store].toArray().then(e=>{
    if(!e.length||force)
      http.get(loader[store]).then(function(data){
        var table=db[store];
        table.clear().then(()=>{
          data=data.data||data;
          table.bulkAdd(data).then(function(lastKey) {
            if(setter){setter(data);}
          }).catch(function (e) {
            console.log(e)
          });
        });
      });
    else
      if(setter){setter(e);}
  });
}
