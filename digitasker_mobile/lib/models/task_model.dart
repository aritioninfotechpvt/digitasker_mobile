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
    final rewardVal = json['reward_per_task'] ?? json['reward'] ?? json['payout'] ?? json['reward_amount'];
    final parsedReward = rewardVal != null ? (double.tryParse(rewardVal.toString()) ?? 250.0) : 250.0;
    
    final categoryVal = json['type'] ?? json['category'] ?? json['task_type'] ?? 'Store Audit';
    final storeNameVal = json['store_name'] ?? json['brand'] ?? (json['task_code'] != null ? 'Ref: ${json['task_code']}' : 'Audit Store');
    final descVal = json['instructions'] ?? json['description'] ?? json['details'] ?? 'Visit the store at the given location and evaluate store hygiene, product displays, staff behavior and pricing.';
    final locationVal = json['location']?.toString() ?? 'Zirakpur, Punjab';

    return TaskModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      title: json['title'] ?? json['name'] ?? 'Store Audit',
      storeName: storeNameVal.toString(),
      description: descVal.toString(),
      reward: parsedReward,
      distance: json['distance']?.toString() ?? '0.8 km',
      duration: json['duration']?.toString() ?? '20-30 mins',
      locationType: (locationVal.toLowerCase().contains('online') || json['location_type'] == 'Online') ? 'Online' : 'On-site',
      location: locationVal,
      category: categoryVal.toString(),
      tags: json['tags'] != null
          ? List<String>.from(json['tags'])
          : [categoryVal.toString(), if (parsedReward >= 400) 'High Reward' else 'Verified'],
      imageUrl: json['image_url']?.toString() ?? json['image']?.toString() ?? '',
      status: json['status']?.toString() ?? 'open',
      isFeatured: json['is_featured'] == 1 || json['is_featured'] == true,
    );
  }
}
