import 'package:app/core/utils/safe_json.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SafeJson.extractDataList', () {
    test('returns [] for null', () {
      expect(SafeJson.extractDataList(null), isEmpty);
    });

    test('returns [] for non-Map non-List', () {
      expect(SafeJson.extractDataList('string'), isEmpty);
      expect(SafeJson.extractDataList(42), isEmpty);
    });

    test('returns direct list', () {
      expect(SafeJson.extractDataList([1, 2, 3]), hasLength(3));
    });

    test('extracts from { "data": [...] }', () {
      expect(SafeJson.extractDataList({'data': [1, 2]}), hasLength(2));
    });

    test('returns [] for { "data": null }', () {
      expect(SafeJson.extractDataList({'data': null}), isEmpty);
    });

    test('returns [] for { "data": [] }', () {
      expect(SafeJson.extractDataList({'data': []}), isEmpty);
    });

    test('extracts from { "data": { "items": [...] } }', () {
      expect(
        SafeJson.extractDataList({
          'data': {'items': [1, 2, 3]},
        }),
        hasLength(3),
      );
    });

    test('extracts from { "data": { "data": [...] } }', () {
      expect(
        SafeJson.extractDataList({
          'data': {'data': [1, 2]},
        }),
        hasLength(2),
      );
    });

    test('extracts from { "items": [...] }', () {
      expect(SafeJson.extractDataList({'items': [1]}), hasLength(1));
    });

    test('extracts from { "results": [...] }', () {
      expect(SafeJson.extractDataList({'results': [1, 2]}), hasLength(2));
    });
  });

  group('SafeJson.readString', () {
    test('returns value for existing key', () {
      expect(SafeJson.readString({'name': 'Kiro'}, ['name']), 'Kiro');
    });

    test('returns fallback when all keys missing', () {
      expect(SafeJson.readString({}, ['name'], fallback: 'default'), 'default');
    });

    test('converts non-string to string', () {
      expect(SafeJson.readString({'val': 123}, ['val']), '123');
    });

    test('tries keys in order', () {
      expect(SafeJson.readString({'b': 'B'}, ['a', 'b', 'c']), 'B');
    });
  });

  group('SafeJson.readInt', () {
    test('reads int', () {
      expect(SafeJson.readInt({'x': 5}, ['x']), 5);
    });

    test('parses string int', () {
      expect(SafeJson.readInt({'x': '42'}, ['x']), 42);
    });

    test('converts double', () {
      expect(SafeJson.readInt({'x': 3.9}, ['x']), 3);
    });

    test('returns fallback for missing key', () {
      expect(SafeJson.readInt({}, ['x'], fallback: 99), 99);
    });
  });

  group('SafeJson.readDouble', () {
    test('reads double', () {
      expect(SafeJson.readDouble({'v': 1.5}, ['v']), 1.5);
    });

    test('parses string double', () {
      expect(SafeJson.readDouble({'v': '3.14'}, ['v']), 3.14);
    });

    test('converts int', () {
      expect(SafeJson.readDouble({'v': 2}, ['v']), 2.0);
    });
  });

  group('SafeJson.readBool', () {
    test('reads bool true', () {
      expect(SafeJson.readBool({'b': true}, ['b']), isTrue);
    });

    test('reads bool false', () {
      expect(SafeJson.readBool({'b': false}, ['b']), isFalse);
    });

    test('reads int 1 as true', () {
      expect(SafeJson.readBool({'b': 1}, ['b']), isTrue);
    });

    test('reads int 0 as false', () {
      expect(SafeJson.readBool({'b': 0}, ['b']), isFalse);
    });

    test('reads string "true" as true', () {
      expect(SafeJson.readBool({'b': 'true'}, ['b']), isTrue);
    });

    test('reads string "false" as false', () {
      expect(SafeJson.readBool({'b': 'false'}, ['b']), isFalse);
    });
  });

  group('SafeJson.readDateTime', () {
    test('parses valid ISO date string', () {
      final dt = SafeJson.readDateTime(
        {'d': '2024-01-15T10:00:00.000Z'},
        ['d'],
      );
      expect(dt.year, 2024);
      expect(dt.month, 1);
      expect(dt.day, 15);
    });

    test('returns epoch fallback for null', () {
      final dt = SafeJson.readDateTime({}, ['d']);
      expect(dt, DateTime.fromMillisecondsSinceEpoch(0));
    });

    test('returns epoch fallback for invalid date', () {
      final dt = SafeJson.readDateTime({'d': 'not-a-date'}, ['d']);
      expect(dt, DateTime.fromMillisecondsSinceEpoch(0));
    });

    test('uses custom fallback', () {
      final fallback = DateTime(2000);
      final dt = SafeJson.readDateTime({}, ['d'], fallback: fallback);
      expect(dt, fallback);
    });
  });

  group('SafeJson.readNullableDateTime', () {
    test('returns null when key missing', () {
      expect(SafeJson.readNullableDateTime({}, ['d']), isNull);
    });

    test('returns null for invalid date', () {
      expect(SafeJson.readNullableDateTime({'d': 'bad'}, ['d']), isNull);
    });

    test('parses valid date', () {
      final dt = SafeJson.readNullableDateTime({'d': '2023-06-01'}, ['d']);
      expect(dt, isNotNull);
      expect(dt!.year, 2023);
    });
  });

  group('SafeJson.readStringList', () {
    test('returns list of strings', () {
      expect(
        SafeJson.readStringList({'imgs': ['a', 'b']}, ['imgs']),
        ['a', 'b'],
      );
    });

    test('returns [] for missing key', () {
      expect(SafeJson.readStringList({}, ['imgs']), isEmpty);
    });

    test('wraps single string in list', () {
      expect(SafeJson.readStringList({'img': 'url'}, ['img']), ['url']);
    });
  });
}
