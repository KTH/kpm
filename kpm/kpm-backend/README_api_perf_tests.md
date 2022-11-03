my-teaching-api/teaching total time will be whichever is slowest of the following two paths:

       ⎧ Canvas API        ⎫
IN --- ⎨                   ⎬ --- OUT
       ⎩ UGRestAPI ⪢ KOPPS ⎭

```s
% traceroute app-r.referens.sys.kth.se
traceroute: Warning: app-r.referens.sys.kth.se has multiple addresses; using 13.107.213.53
traceroute to part-0025.t-0009.t-msedge.net (13.107.213.53), 64 hops max, 52 byte packets
 1  130.229.128.3 (130.229.128.3)  5.064 ms  3.795 ms  3.807 ms
 2  r2sunet-ea7-p2p.gw.kth.se (130.237.211.50)  3.678 ms  3.104 ms  3.619 ms
 3  stockholm-tug-r1.sunet.se (130.242.6.72)  6.111 ms  3.388 ms  5.420 ms
 4  se-tug.nordu.net (109.105.102.17)  4.069 ms  3.955 ms  4.122 ms
 5  se-brm.nordu.net (109.105.97.47)  3.774 ms  3.414 ms  3.938 ms
 6  ndn-gw.microsoft.com (109.105.98.185)  4.217 ms  4.941 ms  4.667 ms

% ping -c 10 app-r.referens.sys.kth.se
PING part-0025.t-0009.t-msedge.net (13.107.213.53): 56 data bytes
64 bytes from 13.107.213.53: icmp_seq=0 ttl=120 time=3.600 ms
64 bytes from 13.107.213.53: icmp_seq=1 ttl=120 time=4.387 ms
64 bytes from 13.107.213.53: icmp_seq=2 ttl=120 time=4.255 ms
64 bytes from 13.107.213.53: icmp_seq=3 ttl=120 time=6.783 ms
64 bytes from 13.107.213.53: icmp_seq=4 ttl=120 time=8.009 ms
64 bytes from 13.107.213.53: icmp_seq=5 ttl=120 time=5.980 ms
64 bytes from 13.107.213.53: icmp_seq=6 ttl=120 time=7.706 ms
64 bytes from 13.107.213.53: icmp_seq=7 ttl=120 time=6.102 ms
64 bytes from 13.107.213.53: icmp_seq=8 ttl=120 time=9.179 ms
64 bytes from 13.107.213.53: icmp_seq=9 ttl=120 time=5.531 ms

--- part-0025.t-0009.t-msedge.net ping statistics ---
10 packets transmitted, 10 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 3.600/6.153/9.179/1.705 ms
```

Analysis of `kpm/kpm/kpm-backend/src/api.ts`:
```ts
const perf1 = Date.now();
const { data, json, statusCode } = await ugClient.get<TUgGroup[]>(`groups?$filter=contains(members, '${userName}')`);
console.log(`Exec time: ${Date.now() - perf1}ms`);
```

NOTE: For these calls we also create UGRestClient. This should be cached in production:
```s
# Total time per call to UG REST API:
[dev:my-teaching-api    ] Exec time: 1736ms
[dev:my-teaching-api    ] Exec time: 1435ms
[dev:my-teaching-api    ] Exec time: 1374ms
[dev:my-teaching-api    ] Exec time: 1411ms
[dev:my-teaching-api    ] Exec time: 1346ms
# Where time to create client is: 
[dev:my-teaching-api    ] Time to create UGRestClient: 87ms

# Single kpm-backend call and timing of calls to API:s from backend:
[dev:my-teaching-api    ] Time to create UGRestClient: 78ms
[dev:my-teaching-api    ] Time to call UGRestClient(get): 1539ms
[dev:kpm-backend        ] Time to resolved my-teaching-api: 1564ms
[dev:kpm-backend        ] Time to resolved my-canvas-rooms-api: 1587ms
[dev:kpm-backend        ] Time to resolved kopps: 1794ms
[dev:kpm-backend        ] Time to resolved kopps: 1800ms
[dev:kpm-backend        ] Time to resolved kopps: 1801ms
```

## Isolated timing for call to Canvas (ref)
```ts
    const perf1 = Date.now();
    const rooms_fut = await get_canvas_rooms(user);
    console.log(`TEST only my-canvas-rooms-api: ${Date.now() - perf1}ms`);
```
```s
[dev:kpm-backend        ] TEST only my-canvas-rooms-api: 1442ms
[dev:kpm-backend        ] TEST only my-canvas-rooms-api: 1553ms
[dev:kpm-backend        ] TEST only my-canvas-rooms-api: 1509ms
```

## Isolated timing for call to KOPPS
```ts
// Implemented similar to above by moving promise initiator 
// to right before the for-loop
```
```s
[dev:kpm-backend        ] Time to resolved kopps: 191ms
[dev:kpm-backend        ] Time to resolved kopps: 296ms
[dev:kpm-backend        ] Time to resolved kopps: 296ms

[dev:kpm-backend        ] Time to resolved kopps: 0ms
[dev:kpm-backend        ] Time to resolved kopps: 1ms
[dev:kpm-backend        ] Time to resolved kopps: 1ms
```

From frontend:
- Total TTLB: 1540ms
    - Time to create UGRestClient: 68ms
    - Time to call UGRestClient(get): 1435ms
    - Time to call Canvas API: 1500ms
