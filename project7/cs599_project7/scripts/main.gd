extends Node3D

var cube_size = 2
var offset = 10
@export var cube_side_count = 8
var num_cubes = cube_side_count ** 3

var objects = []
var meshes = []
var positions = []

@onready var obj_shape = BoxShape3D.new()
@onready var box_mesh = BoxMesh.new()

# create a cube of cubes equally spaced from
# each other.
func create_positions():
	positions.clear()
	print("num cubes is " + str(num_cubes))
	
	for x in cube_side_count:
		for y in cube_side_count:
			for z in cube_side_count:
				var pos = (Vector3(x,y,z) * cube_size) + Vector3(offset, offset, offset)
				positions.append(pos)
			
	#print("positions size is " + str(positions.size()))
	#for pos in positions:
		#print(pos)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	var ps = PhysicsServer3D
	var rs = RenderingServer
	
	create_positions()
	
	for index in num_cubes:
		var object = ps.body_create()
		ps.body_set_space(object, get_world_3d().space)
		#print(obj_shape.size)
		ps.body_add_shape(object, obj_shape)
		
		# set body mode to rigid so it actually collides.
		ps.body_set_mode(object, PhysicsServer3D.BODY_MODE_RIGID)
		
		# object will be a part of collision layer 1
		# and will collide with other objects in layer 1
		ps.body_set_collision_layer(object, 1)
		ps.body_set_collision_mask(object, 1)
		
		ps.body_set_shape_transform(object, 0, Transform3D.IDENTITY)
		var pos = positions[index] + Vector3(0,5,0)
		var trans = Transform3D(Basis.IDENTITY, pos)
		ps.body_set_state(object, PhysicsServer3D.BODY_STATE_TRANSFORM, trans)
		var mesh = rs.instance_create2(box_mesh, get_world_3d().scenario)
		rs.instance_set_transform(mesh, trans)
		meshes.append(mesh)
		objects.append(object)
		

func _physics_process(_delta: float) -> void:
	for index in num_cubes:
		var object = objects[index]
		var mesh = meshes[index]
		var trans = PhysicsServer3D.body_get_state(object, PhysicsServer3D.BODY_STATE_TRANSFORM)
		RenderingServer.instance_set_transform(mesh, trans)

func _input(event):
	if event.is_action_pressed("ui_cancel"):
		get_tree().quit()
	if event.is_action_pressed("reload_scene"):
		get_tree().reload_current_scene()

func _exit_tree() -> void:
	for index in num_cubes:
		var object = objects[index]
		var mesh = meshes[index]
		# remove rigid bodies
		if object:
			PhysicsServer3D.free_rid(object)
			
		# clean up meshes
		if mesh:
			RenderingServer.free_rid(mesh)
	
	meshes.clear()
	objects.clear()
	positions.clear()
