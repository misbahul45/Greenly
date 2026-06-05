part of 'search_product_bloc.dart';

enum SearchStatus { initial, loading, loaded, error }

class SearchProductState extends Equatable {
  final SearchStatus status;
  final List<SearchProductResult> results;
  final List<String> history;
  final bool fromFallback;
  final String? error;
  final String lastQuery;
  final SearchProductFilter filter;

  const SearchProductState({
    this.status = SearchStatus.initial,
    this.results = const [],
    this.history = const [],
    this.fromFallback = false,
    this.error,
    this.lastQuery = '',
    this.filter = const SearchProductFilter(),
  });

  SearchProductState copyWith({
    SearchStatus? status,
    List<SearchProductResult>? results,
    List<String>? history,
    bool? fromFallback,
    String? error,
    String? lastQuery,
    SearchProductFilter? filter,
  }) {
    return SearchProductState(
      status: status ?? this.status,
      results: results ?? this.results,
      history: history ?? this.history,
      fromFallback: fromFallback ?? this.fromFallback,
      error: error,
      lastQuery: lastQuery ?? this.lastQuery,
      filter: filter ?? this.filter,
    );
  }

  @override
  List<Object?> get props => [
        status,
        results,
        history,
        fromFallback,
        error,
        lastQuery,
        filter,
      ];
}
