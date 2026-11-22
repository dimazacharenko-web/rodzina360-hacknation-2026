import assert from 'node:assert/strict';
import {createMobywatelDemoSession,MOBYWATEL_DEMO_NOTICE} from './mobywatelDemo.ts';
const session=createMobywatelDemoSession();
assert.deepEqual(session,{
  provider:'mObywatel',mode:'demonstration',displayName:'Rodzic demonstracyjny',
  authenticated:false,source:'simulated'
},'Demo may never claim real identification');
assert.equal(Object.hasOwn(session,'access_token'),false);
assert.equal(Object.hasOwn(session,'pesel'),false);
assert.equal(Object.hasOwn(session,'password'),false);
assert.equal(Object.hasOwn(session,'expires_at'),false);
assert.match(MOBYWATEL_DEMO_NOTICE,/nie następuje uwierzytelnienie/i);
assert.match(MOBYWATEL_DEMO_NOTICE,/nie jest usługa mObywatel/i);
assert.notEqual(createMobywatelDemoSession(),session,'Separate ephemeral session instances');
console.log('OK: mObywatel demo remains unauthenticated, synthetic, and contains no identity or secret fields');
