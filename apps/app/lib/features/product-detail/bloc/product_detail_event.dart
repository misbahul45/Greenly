class ProductDetailEvent {
  const ProductDetailEvent();

    @override
    List<Object?> get props => [];
}


class GetDetailProduct extends ProductDetailEvent {
  final String slug;

  const GetDetailProduct({required this.slug});
}
