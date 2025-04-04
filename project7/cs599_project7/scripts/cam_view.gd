extends Node3D

@onready var camera_3d: Camera3D = $Camera3D

@export var moveSpeed = 20
var vertical_speed = 4
var turnSpeed = 0.005

#var lookAngle = Vector2.ZERO
var velocity = Vector3.ZERO

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

func _input(event: InputEvent) -> void:
	# mouse rotation
	if event is InputEventMouseMotion:
		# gimbal lock avoided if y and x
		# rotations are done on separate objects
		rotate_y(-event.relative.x * turnSpeed)
		camera_3d.rotate_x(-event.relative.y * turnSpeed)
	
func _process(delta: float) -> void:
	var dir = updateDirection()
	translate(dir * moveSpeed * delta)

func updateDirection():
	var dir = Vector3.ZERO
	
	# get input and set direction appropriately
	if Input.is_action_pressed("forward"):
		dir += Vector3.FORWARD
	if Input.is_action_pressed("backward"):
		dir += Vector3.BACK
	if Input.is_action_pressed("left"):
		dir += Vector3.LEFT
	if Input.is_action_pressed("right"):
		dir += Vector3.RIGHT	
	if Input.is_action_pressed("go_up"):
		dir += Vector3.UP * vertical_speed
		return dir
	if Input.is_action_pressed("go_down"):
		dir += Vector3.DOWN * vertical_speed
		return dir
	
	if dir.is_zero_approx():
		velocity = Vector3.ZERO
		
	# directions should be unit length
	return dir.normalized()
	
