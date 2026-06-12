import 'package:app/core/constants/ui_constants.dart';
import 'package:flutter/material.dart';

SliverGridDelegate adaptiveProductGridDelegate({
  double maxCrossAxisExtent = 230,
  double childAspectRatio = 0.55,
}) {
  return SliverGridDelegateWithMaxCrossAxisExtent(
    maxCrossAxisExtent: maxCrossAxisExtent,
    crossAxisSpacing: UIConstants.spacingM,
    mainAxisSpacing: UIConstants.spacingM,
    childAspectRatio: childAspectRatio,
  );
}
