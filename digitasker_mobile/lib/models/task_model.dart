class TaskModel {
  final int id;
  final String title;
  final String storeName;
  final String description;
  final double reward;
  final String distance; // e.g. '0.8 km'
  final String duration; // e.g. '30-45 mins'
  final String locationType; // e.g. 'On-site', 'Online Task'
  final String location; // e.g. 'Zirakpur, Punjab'
  final String category;
  final List<String> tags; // e.g. ['New', 'Easy']
  final String imageUrl;
  final String status;
  final bool isFeatured;

  TaskModel({
    required this.id,
    required this.title,
    required this.storeName,
    required this.description,
    required this.reward,
    this.distance = '0.8 km',
    this.duration = '30-45 mins',
    this.locationType = 'On-site',
    this.location = 'Zirakpur',
    required this.category,
    this.tags = const [],
    this.imageUrl = '',
    required this.status,
    this.isFeatured = false,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      title: json['title'] ?? json['name'] ?? 'Store Audit',
      storeName: json['store_name'] ?? json['brand'] ?? 'DMart',
      description: json['description'] ??
          'Visit the store at the given location and evaluate store hygiene, product displays, staff behavior and pricing.',
      reward: json['reward'] != null
          ? double.tryParse(json['reward'].toString()) ?? 250.0
          : 250.0,
      distance: json['distance']?.toString() ?? '0.8 km',
      duration: json['duration']?.toString() ?? '30-45 mins',
      locationType: json['location_type']?.toString() ?? 'On-site',
      location: json['location']?.toString() ?? 'Zirakpur',
      category: json['category']?.toString() ?? 'Store Audit',
      tags: json['tags'] != null
          ? List<String>.from(json['tags'])
          : ['New', 'Easy'],
      imageUrl: json['image_url']?.toString() ?? '',
      status: json['status']?.toString() ?? 'open',
      isFeatured: json['is_featured'] == 1 || json['is_featured'] == true,
    );
  }
}
