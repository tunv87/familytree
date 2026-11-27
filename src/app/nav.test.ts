import { describe, expect, it } from 'vitest';
import { parentPath } from './nav';

describe('UX-13 nút ← về màn cha (sơ đồ đã duyệt trên mock)', () => {
  it.each([
    ['/', '', null],
    ['/people', '', '/'],
    ['/tree', '', '/'],
    ['/tree', '?focus=a1', '/'],
    ['/tree', '?root=a1', '/p/a1'],
    ['/calendar', '', '/'],
    ['/invite', '', '/'],
    ['/settings', '', '/'],
    ['/debug', '', '/settings'],
    ['/families', '', '/'],
    ['/new-family', '', '/families'],
    ['/p/a1', '', '/people'],
    ['/edit/a1', '', '/p/a1'],
    ['/relations/a1', '', '/p/a1'],
    ['/add', '?parent=a1', '/p/a1'],
    ['/add', '?spouse=a1', '/p/a1'],
    ['/add', '?child=a1&gender=m', '/p/a1'],
    ['/add', '?sibling=a1', '/p/a1'],
    ['/add', '?first=1', '/'],
    ['/add', '', '/people'],
    ['/kinship', '?a=me&b=a1', '/p/a1'],
    ['/kinship', '', '/'],
    ['/f/AbCdEfGhJkMnPqRsTuVw', '', '/'],
    ['/khong-co', '', '/'],
  ])('%s%s → %s', (path, search, parent) => {
    expect(parentPath(path, search)).toBe(parent);
  });

  it('a profile opened from the tree or the calendar goes back there (P2)', () => {
    expect(parentPath('/p/a1', '', { from: '/tree?focus=a1' })).toBe('/tree?focus=a1');
    expect(parentPath('/p/a1', '', { from: '/calendar' })).toBe('/calendar');
  });
});
