import 'package:flutter/material.dart';

class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? parentId;
  final IconData icon;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.parentId,
    required this.icon,
  });
}
