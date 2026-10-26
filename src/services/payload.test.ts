// Rodar com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLampState, parseSensorValue } from './payload.ts';

test('parseSensorValue', () => {
  assert.equal(parseSensorValue('{"value":24.5}'), 24.5);
  assert.equal(parseSensorValue('{"value":0}'), 0);
  for (const bad of ['', 'abc', '24', 'null', '[1]', '{"value":"24"}', '{"valor":1}', '{"value":null}']) {
    assert.equal(parseSensorValue(bad), null, bad);
  }
});

test('parseLampState', () => {
  assert.equal(parseLampState('{"state":"ON"}'), 'ON');
  assert.equal(parseLampState('{"state":"OFF"}'), 'OFF');
  for (const bad of ['', 'ON', '{"state":"on"}', '{"state":1}', '{}']) {
    assert.equal(parseLampState(bad), null, bad);
  }
});
