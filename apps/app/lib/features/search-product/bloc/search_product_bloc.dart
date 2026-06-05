import 'package:app/features/search-product/domain/data/search_product_result.dart';
import 'package:app/features/search-product/domain/dto/search_product_filter.dart';
import 'package:app/features/search-product/service/search_product_service.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'search_product_event.dart';
part 'search_product_state.dart';

class SearchProductBloc extends Bloc<SearchProductEvent, SearchProductState> {
  final SearchProductService _service;
  static const String _historyKey = 'search_product_history';
  static const int _maxHistory = 10;

  SearchProductBloc(this._service) : super(const SearchProductState()) {
    on<SearchProductStarted>(_onStarted);
    on<SearchProductSubmitted>(_onSubmitted);
    on<SearchProductRetryRequested>(_onRetry);
    on<SearchProductFilterUpdated>(_onFilterUpdated);
    on<SearchProductHistoryClearRequested>(_onHistoryClear);
    on<SearchProductHistoryItemRemoved>(_onHistoryRemove);
  }

  Future<void> _onStarted(
    SearchProductStarted event,
    Emitter<SearchProductState> emit,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final history = prefs.getStringList(_historyKey) ?? [];
    emit(state.copyWith(history: history));
  }

  Future<void> _onSubmitted(
    SearchProductSubmitted event,
    Emitter<SearchProductState> emit,
  ) async {
    final query = event.query.trim();
    if (query.isEmpty) return;

    emit(state.copyWith(
      status: SearchStatus.loading,
      lastQuery: query,
      filter: event.filter,
      error: null,
    ));

    try {
      final pair = await _service.search(
        query: query,
        filters: event.filter.isEmpty ? null : event.filter,
      );

      final newHistory = [
        query,
        ...state.history.where((h) => h != query),
      ].take(_maxHistory).toList();

      await _saveHistory(newHistory);

      emit(state.copyWith(
        status: SearchStatus.loaded,
        results: pair.results,
        fromFallback: pair.fromFallback,
        history: newHistory,
        error: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: SearchStatus.error,
        results: [],
        error: e.toString(),
      ));
    }
  }

  void _onRetry(
    SearchProductRetryRequested event,
    Emitter<SearchProductState> emit,
  ) {
    if (state.lastQuery.isEmpty) return;
    add(SearchProductSubmitted(query: state.lastQuery, filter: state.filter));
  }

  void _onFilterUpdated(
    SearchProductFilterUpdated event,
    Emitter<SearchProductState> emit,
  ) {
    emit(state.copyWith(filter: event.filter));
  }

  Future<void> _onHistoryClear(
    SearchProductHistoryClearRequested event,
    Emitter<SearchProductState> emit,
  ) async {
    await _saveHistory([]);
    emit(state.copyWith(history: []));
  }

  Future<void> _onHistoryRemove(
    SearchProductHistoryItemRemoved event,
    Emitter<SearchProductState> emit,
  ) async {
    final newHistory = state.history.where((h) => h != event.query).toList();
    await _saveHistory(newHistory);
    emit(state.copyWith(history: newHistory));
  }

  Future<void> _saveHistory(List<String> history) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_historyKey, history);
  }
}
