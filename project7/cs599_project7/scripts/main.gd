extends Node3D

var physics_recording_duration = 4
var cube_size = 2
var offset = 10
@export var cube_side_count = 8
@export var max_side_count = 11
var num_objects = cube_side_count ** 3


var objects = []
var meshes = []
var positions = []

@onready var cs_599_profiler: CS599TimerSignal = $CS599TimerSignal
@onready var timer: Timer = $Timer

@onready var boxMesh = BoxMesh.new()
@onready var sphereMesh = SphereMesh.new()

@onready var boxShape = BoxShape3D.new()
@onready var sphereShape = SphereShape3D.new()

# various controls for simulation
@export var use_sphere = false
@export var should_increment_count = true
@export var should_respawn_objects = true

# create a cube of cubes equally spaced from
# each other.
func create_positions():
	positions.clear()
	print("num objects is " + str(num_objects))
	
	for x in cube_side_count:
		for y in cube_side_count:
			for z in cube_side_count:
				var pos = (Vector3(x,y,z) * cube_size) + Vector3(offset, offset, offset)
				positions.append(pos)

func createObjects():
	var ps = PhysicsServer3D
	var rs = RenderingServer
	
	var obj_shape
	var obj_mesh
	
	if use_sphere:
		obj_shape = sphereShape
		obj_mesh = sphereMesh
	else:
		obj_shape = boxShape
		obj_mesh = boxMesh
	
	create_positions()
	
	for index in num_objects:
		var object = ps.body_create()
		ps.body_set_space(object, get_world_3d().space)
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
		
		# physics properties
		ps.body_set_param(object, PhysicsServer3D.BODY_PARAM_BOUNCE, 1)
		
		var mesh = rs.instance_create2(obj_mesh, get_world_3d().scenario)
		rs.instance_set_transform(mesh, trans)
		meshes.append(mesh)
		objects.append(object)

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	createObjects()
	timer.wait_time = physics_recording_duration
	timer.start()
	cs_599_profiler.clearRecords()
	cs_599_profiler.startRecording("num objects " + str(num_objects))
	
# when timer is finished spawn next set of objects for collision
func _on_timer_timeout() -> void:
	if should_respawn_objects:
		cs_599_profiler.endRecording()
		clearObjects()
		if should_increment_count:
			cube_side_count += 1
		
		if cube_side_count > max_side_count:
			print("cube side count max reached: ", cube_side_count)
			endPlay();
			return
		
		num_objects = cube_side_count ** 3
		createObjects()
		timer.start()
		cs_599_profiler.startRecording("num objects " + str(num_objects))

func _physics_process(_delta: float) -> void:
	for index in num_objects:
		var object = objects[index]
		var mesh = meshes[index]
		var trans = PhysicsServer3D.body_get_state(object, PhysicsServer3D.BODY_STATE_TRANSFORM)
		RenderingServer.instance_set_transform(mesh, trans)

func endPlay():
	print("ending play")
		
	if use_sphere:
		cs_599_profiler.setFileSuffix("_spheres")
	else:
		cs_599_profiler.setFileSuffix("_cubes")
	
	cs_599_profiler.saveToCSV()
	cs_599_profiler.clearRecords()
	get_tree().quit()

func _input(event):
	if event.is_action_pressed("ui_cancel"):
		endPlay()
	elif event.is_action_pressed("reload_scene"):
		cs_599_profiler.clearRecords()
		get_tree().reload_current_scene()

func clearObjects():
	if !objects.is_empty():
		for index in num_objects:
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
