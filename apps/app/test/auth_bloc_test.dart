import 'dart:convert';

import 'package:app/features/auth/auth_service.dart';
import 'package:app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:app/features/auth/presentation/bloc/auth_event.dart';
import 'package:app/features/auth/presentation/bloc/auth_state.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AuthBloc', () {
    test('auth check preserves existing stored session', () async {
      FlutterSecureStorage.setMockInitialValues({
        'access_token': 'access-token',
        'refresh_token': 'refresh-token',
        'user_data': jsonEncode({
          'id': 'user-1',
          'name': 'User One',
          'email': 'user@example.com',
          'status': 'ACTIVE',
          'roles': ['CUSTOMER'],
        }),
      });

      final bloc = AuthBloc(AuthService());
      addTearDown(bloc.close);

      bloc.add(AuthCheckRequested());

      await expectLater(
        bloc.stream,
        emitsInOrder([
          isA<AuthLoading>(),
          isA<AuthAuthenticated>()
              .having((state) => state.user.id, 'user id', 'user-1')
              .having(
                (state) => state.tokens.accessToken,
                'access token',
                'access-token',
              ),
        ]),
      );
    });
  });
}
