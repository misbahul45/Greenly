part of 'search_product_bloc.dart';

abstract class SearchProductEvent extends Equatable {
  const SearchProductEvent();

  @override
  List<Object?> get props => [];
}

class SearchProductStarted extends SearchProductEvent {
  const SearchProductStarted();
}

class SearchProductSubmitted extends SearchProductEvent {
  final String query;
  final SearchProductFilter filter;

  const SearchProductSubmitted({
    required this.query,
    this.filter = const SearchProductFilter(),
  });

  @override
  List<Object?> get props => [query, filter];
}

class SearchProductRetryRequested extends SearchProductEvent {
  const SearchProductRetryRequested();
}

class SearchProductFilterUpdated extends SearchProductEvent {
  final SearchProductFilter filter;

  const SearchProductFilterUpdated(this.filter);

  @override
  List<Object?> get props => [filter];
}

class SearchProductHistoryClearRequested extends SearchProductEvent {
  const SearchProductHistoryClearRequested();
}

class SearchProductHistoryItemRemoved extends SearchProductEvent {
  final String query;

  const SearchProductHistoryItemRemoved(this.query);

  @override
  List<Object?> get props => [query];
}
