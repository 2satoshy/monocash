
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useStore } from '../../store/useStore';

export class Stage {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;

  private plane: THREE.Mesh | null = null;
  private gridHelper: THREE.GridHelper | null = null;

  private followTarget: THREE.Vector3 | null = null;
  private readonly defaultTarget = new THREE.Vector3(0, 0.8, 0);

  constructor(rendererElement: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(10, 8, 15);

    this.controls = new OrbitControls(this.camera, rendererElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.8;
    this.controls.enableRotate = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.minPolarAngle = Math.PI / 4.5;
    this.controls.maxPolarAngle = Math.PI / 2.4;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 50; // Increased to allow viewing larger worlds
    this.controls.target.set(0, 0.8, 0);

    this.controls.addEventListener('start', () => {
      rendererElement.style.cursor = 'grabbing';
    });
    this.controls.addEventListener('end', () => {
      rendererElement.style.cursor = 'auto';
    });

    this.setupLights();
    // Environment is initialized with a default, but updated via updateDimensions immediately in SceneManager
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1 * Math.PI);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5 * Math.PI);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.bias = -0.002;
    dirLight.shadow.radius = 2;
    dirLight.shadow.autoUpdate = false;
    dirLight.shadow.needsUpdate = true;
    this.scene.add(dirLight);
  }

  public updateDimensions(radius: number) {
    const diameter = radius * 2;
    const gridDivisions = Math.round(diameter); // 1 unit per division approx

    // 1. Remove old
    if (this.plane) {
        this.scene.remove(this.plane);
        if (this.plane.geometry) this.plane.geometry.dispose();
        if (this.plane.material instanceof THREE.Material) this.plane.material.dispose();
    }
    if (this.gridHelper) {
        this.scene.remove(this.gridHelper);
        if (this.gridHelper.geometry) this.gridHelper.geometry.dispose();
        if (this.gridHelper.material instanceof THREE.Material) this.gridHelper.material.dispose();
    }

    // 2. Create New Plane
    const planeGeometry = new THREE.PlaneGeometry(diameter, diameter);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new THREE.MeshStandardNodeMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.receiveShadow = true;
    this.plane.position.y = -0.01;
    this.scene.add(this.plane);

    // 3. Create New Grid
    this.gridHelper = new THREE.GridHelper(diameter, gridDivisions, 0x444444, 0x222222);
    this.scene.add(this.gridHelper);

    // 4. Create Board Tiles
    this.createBoardTiles(radius);
  }

  private createBoardTiles(radius: number) {
    const { tiles } = useStore.getState();
    if (tiles.length > 0) return; // Already created

    const newTiles: any[] = [];
    const size = radius * 0.9;
    const divisions = 10;
    const step = (size * 2) / divisions;

    // Create perimeter tiles
    for (let i = 0; i <= divisions; i++) {
      // Top row
      newTiles.push(this.createTileData(`top-${i}`, -size + i * step, -size, i === 0 ? 'GO' : 'ASSET'));
      // Bottom row
      newTiles.push(this.createTileData(`bottom-${i}`, -size + i * step, size, 'DEFI'));
      // Left row (skip corners)
      if (i > 0 && i < divisions) {
        newTiles.push(this.createTileData(`left-${i}`, -size, -size + i * step, 'CHANCE'));
        newTiles.push(this.createTileData(`right-${i}`, size, -size + i * step, 'RANK_UP'));
      }
    }

    // Create some inner maze paths
    for (let i = 2; i < divisions - 2; i += 2) {
      newTiles.push(this.createTileData(`inner-h-${i}`, -size + i * step, 0, 'ASSET'));
      newTiles.push(this.createTileData(`inner-v-${i}`, 0, -size + i * step, 'DEFI'));
    }

    useStore.setState({ tiles: newTiles });

    // Render tiles in 3D
    newTiles.forEach(tile => {
      const geo = new THREE.BoxGeometry(step * 0.8, 0.1, step * 0.8);
      const mat = new THREE.MeshStandardNodeMaterial({ color: tile.color, emissive: tile.color, emissiveIntensity: 0.2 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(tile.position.x, 0.05, tile.position.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Add a small label or glow? For now just the mesh.
    });
  }

  private createTileData(id: string, x: number, z: number, type: string) {
    const colors = {
      'GO': '#3b82f6',
      'ASSET': '#22c55e',
      'DEFI': '#eab308',
      'CHANCE': '#a855f7',
      'RANK_UP': '#ef4444'
    };
    const names = {
      'GO': 'Genesis Block',
      'ASSET': 'Crypto Asset',
      'DEFI': 'DeFi Protocol',
      'CHANCE': 'Market Event',
      'RANK_UP': 'Rank Up Station'
    };

    return {
      id,
      type,
      name: (names as any)[type],
      position: { x, z },
      color: (colors as any)[type],
      description: `A ${type} tile for trading and coordination.`
    };
  }

  public onResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** Call every frame with the character's world position to follow, or null to return to origin. */
  public setFollowTarget(pos: THREE.Vector3 | null) {
    this.followTarget = pos ? pos.clone() : null;
  }

  public update() {
    const lerpTarget = this.followTarget
      ? new THREE.Vector3(this.followTarget.x, 0.8, this.followTarget.z)
      : this.defaultTarget;
    this.controls.target.lerp(lerpTarget, 0.06);
    this.controls.update();
  }
}
