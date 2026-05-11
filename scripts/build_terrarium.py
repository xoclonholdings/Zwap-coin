"""
Procedural builder for the sci-fi wellness terrarium GLB asset.
Outputs: /app/assets/terrarium.glb

Named meshes (top-level nodes):
    Plant, Leaves, Flower, Moss, GlassDome, Base, NeonRing

Author: E1
"""
import io
import os
import json
import struct
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals
from PIL import Image, ImageDraw, ImageFilter

OUT_PATH = "/app/assets/terrarium.glb"
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

rng = np.random.default_rng(42)

# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------
def rotation_matrix(axis, angle):
    return trimesh.transformations.rotation_matrix(angle, axis)

def translation_matrix(t):
    M = np.eye(4)
    M[:3, 3] = t
    return M

def concat_transform(*Ms):
    out = np.eye(4)
    for M in Ms:
        out = out @ M
    return out

def apply_T(mesh, T):
    m = mesh.copy()
    m.apply_transform(T)
    return m

# ----------------------------------------------------------------------
# Procedural textures
# ----------------------------------------------------------------------
def make_leaf_texture(size=512):
    """Albedo with subtle vein lines + light/dark variation."""
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    cx = size / 2.0
    # Base green gradient (darker at edges, lighter near center vein)
    dist = np.abs(xx - cx) / cx  # 0 at center, 1 at edge
    v = yy / size  # 0 at top (tip), 1 at bottom (base)
    base_r = 50 + 8 * (1 - dist)
    base_g = 110 + 30 * (1 - dist) - 25 * v
    base_b = 45 + 6 * (1 - dist)
    arr = np.stack([base_r, base_g, base_b], axis=-1)
    # Subtle horizontal striping for vein bands
    band = 0.5 + 0.5 * np.sin(v * 16 * np.pi)
    arr[..., 1] += band * 4
    # Noise
    noise = rng.normal(0, 4, (size, size, 1))
    arr += noise
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)

    draw = ImageDraw.Draw(img)
    # Central vein (slightly lighter green)
    draw.line([(cx, 0), (cx, size)], fill=(140, 175, 90), width=4)
    # Lateral veins forking from center
    n_veins = 9
    for i in range(n_veins):
        t = 0.05 + i * (0.9 / (n_veins - 1))
        y0 = int(t * size)
        spread = int(0.35 * size * (1 - t * 0.4))
        # right side
        draw.line(
            [(cx, y0 + 6), (cx + spread, y0 - int(spread * 0.55))],
            fill=(95, 135, 65), width=2,
        )
        # left side
        draw.line(
            [(cx, y0 + 6), (cx - spread, y0 - int(spread * 0.55))],
            fill=(95, 135, 65), width=2,
        )
    img = img.filter(ImageFilter.GaussianBlur(radius=0.7))
    # Add highlight stroke along central vein
    draw = ImageDraw.Draw(img)
    draw.line([(cx, 0), (cx, size)], fill=(160, 200, 110), width=1)
    return img


def make_moss_texture(size=256):
    """Mossy moist soil texture."""
    arr = rng.integers(20, 50, (size, size, 3)).astype(np.uint8)
    arr[..., 1] = rng.integers(60, 130, (size, size))  # green
    arr[..., 0] = arr[..., 0] // 2 + 25
    arr[..., 2] = arr[..., 2] // 2 + 20
    img = Image.fromarray(arr)
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    # Tiny moss specks
    draw = ImageDraw.Draw(img)
    for _ in range(450):
        x, y = rng.integers(0, size, 2)
        c = (
            int(rng.integers(80, 170)),
            int(rng.integers(120, 220)),
            int(rng.integers(40, 110)),
        )
        r = int(rng.integers(1, 3))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=c)
    return img


# ----------------------------------------------------------------------
# Geometry builders
# ----------------------------------------------------------------------
def build_base():
    """Black tech base — two stacked cylinders with small recessed top deck."""
    lower = trimesh.creation.cylinder(radius=1.25, height=0.20, sections=64)
    lower.apply_translation([0, 0.10, 0])
    # match Y-up convention via swap; trimesh cylinder is Z-up by default
    lower = apply_T(
        trimesh.creation.cylinder(radius=1.25, height=0.20, sections=64),
        rotation_matrix([1, 0, 0], np.pi / 2),
    )
    lower.apply_translation([0, 0.10, 0])

    upper = apply_T(
        trimesh.creation.cylinder(radius=1.12, height=0.12, sections=64),
        rotation_matrix([1, 0, 0], np.pi / 2),
    )
    upper.apply_translation([0, 0.26, 0])

    # Small leaf-icon recess at front (a tiny torus-button)
    button = apply_T(
        trimesh.creation.cylinder(radius=0.13, height=0.06, sections=32),
        rotation_matrix([0, 0, 1], np.pi / 2),
    )
    button.apply_translation([0, 0.10, 1.12])

    mesh = trimesh.util.concatenate([lower, upper, button])
    mesh.visual = TextureVisuals(
        material=PBRMaterial(
            name="BaseMat",
            baseColorFactor=[0.05, 0.06, 0.07, 1.0],
            metallicFactor=0.6,
            roughnessFactor=0.35,
        )
    )
    return mesh


def build_neon_ring():
    """Lime emissive torus on the deck rim."""
    ring = trimesh.creation.torus(
        major_radius=1.16, minor_radius=0.018,
        major_sections=96, minor_sections=12,
    )
    ring = apply_T(ring, rotation_matrix([1, 0, 0], np.pi / 2))
    ring.apply_translation([0, 0.33, 0])
    ring.visual = TextureVisuals(
        material=PBRMaterial(
            name="NeonRingMat",
            baseColorFactor=[0.55, 1.0, 0.25, 1.0],
            emissiveFactor=[0.70, 1.0, 0.20],
            metallicFactor=0.0,
            roughnessFactor=0.35,
        )
    )
    return ring


def build_moss():
    """Flattened, slightly noisy dome of moss/soil."""
    sphere = trimesh.creation.icosphere(subdivisions=3, radius=0.95)
    # Keep upper hemisphere
    v = sphere.vertices.copy()
    v[v[:, 1] < 0, 1] = 0
    # Squash vertically
    v[:, 1] *= 0.22
    # Perturb noise for organic mound
    noise = rng.normal(0, 0.012, v.shape)
    v += noise * np.array([1, 0.6, 1])
    sphere.vertices = v
    sphere.apply_translation([0, 0.32, 0])
    tex = make_moss_texture(256)
    # Spherical UVs
    u = 0.5 + np.arctan2(sphere.vertices[:, 2], sphere.vertices[:, 0]) / (2 * np.pi)
    w = 0.5 - sphere.vertices[:, 1]
    uv = np.stack([u, w], axis=-1)
    sphere.visual = TextureVisuals(
        uv=uv,
        material=PBRMaterial(
            name="MossMat",
            baseColorTexture=tex,
            baseColorFactor=[1.0, 1.0, 1.0, 1.0],
            roughnessFactor=0.95,
            metallicFactor=0.0,
        ),
    )
    return sphere


def bezier_curve(P0, P1, P2, P3, n=40):
    t = np.linspace(0, 1, n)[:, None]
    return (
        (1 - t) ** 3 * P0
        + 3 * (1 - t) ** 2 * t * P1
        + 3 * (1 - t) * t ** 2 * P2
        + t ** 3 * P3
    )


def tube_along_path(path, radii, sides=10):
    """Build a tube mesh by sweeping a circle along a path."""
    pts = np.asarray(path)
    n = len(pts)
    # Tangents
    tangents = np.zeros_like(pts)
    tangents[1:-1] = pts[2:] - pts[:-2]
    tangents[0] = pts[1] - pts[0]
    tangents[-1] = pts[-1] - pts[-2]
    tangents /= np.linalg.norm(tangents, axis=1, keepdims=True) + 1e-9
    # Build frames
    up = np.array([0, 1, 0])
    verts = []
    for i, (p, t, r) in enumerate(zip(pts, tangents, radii)):
        # Pick a right vector perpendicular to t
        right = np.cross(t, up)
        if np.linalg.norm(right) < 1e-4:
            right = np.array([1.0, 0, 0])
        right /= np.linalg.norm(right)
        normal = np.cross(right, t)
        normal /= np.linalg.norm(normal)
        for k in range(sides):
            a = 2 * np.pi * k / sides
            v = p + (np.cos(a) * right + np.sin(a) * normal) * r
            verts.append(v)
    verts = np.array(verts)
    # Faces
    faces = []
    for i in range(n - 1):
        for k in range(sides):
            a = i * sides + k
            b = i * sides + (k + 1) % sides
            c = (i + 1) * sides + k
            d = (i + 1) * sides + (k + 1) % sides
            faces.append([a, b, d])
            faces.append([a, d, c])
    return trimesh.Trimesh(vertices=verts, faces=faces, process=False)


def build_plant():
    """Curved main stem from base to top."""
    P0 = np.array([0.0, 0.45, 0.0])
    P1 = np.array([0.12, 0.95, 0.05])
    P2 = np.array([-0.08, 1.40, -0.04])
    P3 = np.array([0.05, 1.92, 0.02])
    path = bezier_curve(P0, P1, P2, P3, n=32)
    radii = np.linspace(0.045, 0.018, len(path))
    stem = tube_along_path(path, radii, sides=10)
    stem.visual = TextureVisuals(
        material=PBRMaterial(
            name="PlantMat",
            baseColorFactor=[0.32, 0.55, 0.20, 1.0],
            roughnessFactor=0.8,
            metallicFactor=0.0,
        )
    )
    # Expose stem path for leaf placement
    stem.metadata["path"] = path
    return stem


def build_leaf_mesh(length=0.55, width=0.27, segments=14, curl=0.07):
    """A single double-sided leaf with UVs."""
    s = np.linspace(0, 1, segments)
    t = np.linspace(-1, 1, segments)
    S, T = np.meshgrid(s, t, indexing="ij")
    # Width profile - leaf-like (widest around 35-45% from base)
    profile = (np.sin(S * np.pi) ** 0.85) * (1.0 - 0.25 * S)
    X = T * profile * width
    # Slight cupping (downward at edges)
    Z = -curl * (1 - T ** 2) * np.sin(S * np.pi)
    # Slight upward arch along length
    arch = -0.05 * np.sin(S * np.pi)
    Y = S * length
    verts = np.stack([X, Z + arch, Y], axis=-1).reshape(-1, 3)
    faces = []
    sg = segments
    for i in range(sg - 1):
        for j in range(sg - 1):
            a = i * sg + j
            b = a + 1
            c = a + sg
            d = c + 1
            faces.append([a, c, b])
            faces.append([b, c, d])
    faces = np.array(faces)
    # UV: u across width, v along length
    uvs = np.stack([(T + 1) * 0.5, 1.0 - S], axis=-1).reshape(-1, 2)
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    mesh.visual = TextureVisuals(uv=uvs)
    return mesh


def build_leaves(stem_path, leaf_tex):
    """Cluster of leaves emerging from the stem at various heights/angles."""
    placements = [
        # (t_along_path, yaw_deg, pitch_deg, scale)
        (0.18, 35,   18, 0.95),
        (0.22, -150, 22, 0.90),
        (0.40, 95,   14, 1.10),
        (0.45, -55,  20, 1.05),
        (0.58, 175,  10, 1.15),
        (0.62, 10,   24, 0.95),
        (0.75, -110, 12, 1.05),
        (0.78, 60,   18, 1.00),
        (0.88, 200,  20, 0.85),
        (0.92, -20,  26, 0.80),
    ]
    leaves = []
    n_path = len(stem_path)
    for (tt, yaw, pitch, sc) in placements:
        idx = int(tt * (n_path - 1))
        attach = stem_path[idx].copy()
        leaf = build_leaf_mesh(length=0.55 * sc, width=0.27 * sc)
        # Pitch leaf upward a bit
        T = concat_transform(
            translation_matrix(attach),
            rotation_matrix([0, 1, 0], np.deg2rad(yaw)),
            rotation_matrix([1, 0, 0], np.deg2rad(-pitch)),
        )
        leaf.apply_transform(T)
        leaves.append(leaf)
    merged = trimesh.util.concatenate(leaves)
    # Apply shared material with leaf texture
    # concatenate strips UVs unless visuals are matching; reapply
    # Build merged UVs from individual ones
    all_uvs = np.concatenate([l.visual.uv for l in leaves], axis=0)
    merged.visual = TextureVisuals(
        uv=all_uvs,
        material=PBRMaterial(
            name="LeafMat",
            baseColorTexture=leaf_tex,
            baseColorFactor=[1.0, 1.0, 1.0, 1.0],
            roughnessFactor=0.55,
            metallicFactor=0.0,
            doubleSided=True,
        ),
    )
    return merged


def build_flower():
    """6-petal white flower with yellow-green emissive center near top of stem."""
    center_pos = np.array([0.05, 2.00, 0.02])
    petals = []
    petal_uvs = []
    for i in range(6):
        ang = i * (2 * np.pi / 6)
        petal = build_leaf_mesh(length=0.30, width=0.18, segments=10, curl=0.05)
        # Tilt petal slightly upward, splayed outward
        T = concat_transform(
            translation_matrix(center_pos),
            rotation_matrix([0, 1, 0], ang),
            rotation_matrix([1, 0, 0], np.deg2rad(-65)),
        )
        petal.apply_transform(T)
        petals.append(petal)
        petal_uvs.append(petal.visual.uv)
    petal_mesh = trimesh.util.concatenate(petals)
    petal_mesh.visual = TextureVisuals(
        uv=np.concatenate(petal_uvs, axis=0),
        material=PBRMaterial(
            name="FlowerPetalMat",
            baseColorFactor=[0.97, 0.97, 0.94, 1.0],
            roughnessFactor=0.4,
            metallicFactor=0.0,
            emissiveFactor=[0.05, 0.06, 0.05],
            doubleSided=True,
        ),
    )
    # Center (yellow-green emissive sphere)
    center = trimesh.creation.icosphere(subdivisions=2, radius=0.06)
    center.apply_translation(center_pos)
    center.visual = TextureVisuals(
        material=PBRMaterial(
            name="FlowerCenterMat",
            baseColorFactor=[0.95, 0.95, 0.25, 1.0],
            emissiveFactor=[0.85, 0.95, 0.30],
            roughnessFactor=0.5,
            metallicFactor=0.0,
        )
    )
    # Concatenate but keep as one Flower group; we'll set one material though.
    # Use trimesh Scene later for separate sub-meshes; for the named-mesh
    # spec, return petals + center as a single merged mesh (Flower).
    # We'll keep them as separate geometries within the scene under "Flower".
    return petal_mesh, center


def build_glass_dome():
    """Transparent dome — hemisphere shell with thin rim."""
    sphere = trimesh.creation.icosphere(subdivisions=4, radius=1.07)
    v = sphere.vertices.copy()
    keep = v[:, 1] >= -0.02
    # Simpler: just flatten lower hemisphere into the rim plane
    v[v[:, 1] < 0, 1] = 0
    # Make it taller (egg-like dome)
    v[:, 1] *= 1.78
    sphere.vertices = v
    sphere.apply_translation([0, 0.32, 0])
    # Add a thin rim cylinder at base to seal visually
    rim = apply_T(
        trimesh.creation.cylinder(radius=1.08, height=0.04, sections=64),
        rotation_matrix([1, 0, 0], np.pi / 2),
    )
    rim.apply_translation([0, 0.34, 0])
    dome = trimesh.util.concatenate([sphere, rim])
    dome.visual = TextureVisuals(
        material=PBRMaterial(
            name="GlassMat",
            baseColorFactor=[0.85, 0.92, 0.98, 0.18],
            roughnessFactor=0.05,
            metallicFactor=0.0,
            alphaMode="BLEND",
            doubleSided=True,
        )
    )
    return dome


# ----------------------------------------------------------------------
# Build the scene
# ----------------------------------------------------------------------
def main():
    print("Building textures...")
    leaf_tex = make_leaf_texture(512)

    print("Building geometries...")
    base = build_base()
    ring = build_neon_ring()
    moss = build_moss()
    plant = build_plant()
    stem_path = plant.metadata["path"]
    leaves = build_leaves(stem_path, leaf_tex)
    flower_petals, flower_center = build_flower()
    glass = build_glass_dome()

    # Merge flower components into one Flower geometry but keep materials.
    # For GLB, separate materials require separate geometries; we want one
    # named node "Flower" — use a scene subgraph: add center as child node.
    # Simpler: keep Flower as petals only; center becomes "FlowerCore".
    # The spec lists "Flower" — we'll merge by appending under same scene
    # name with two primitives (trimesh doesn't easily do multi-primitive
    # per mesh), so we expose both under one parent transform.

    scene = trimesh.Scene()
    scene.add_geometry(base,           node_name="Base",         geom_name="Base")
    scene.add_geometry(ring,           node_name="NeonRing",     geom_name="NeonRing")
    scene.add_geometry(moss,           node_name="Moss",         geom_name="Moss")
    scene.add_geometry(plant,          node_name="Plant",        geom_name="Plant")
    scene.add_geometry(leaves,         node_name="Leaves",       geom_name="Leaves")
    scene.add_geometry(flower_petals,  node_name="Flower",       geom_name="Flower")
    scene.add_geometry(flower_center,  node_name="FlowerCore",   geom_name="FlowerCore")
    scene.add_geometry(glass,          node_name="GlassDome",    geom_name="GlassDome")

    # Final pass: scale so total height ~= 2.5 units, origin at base center
    bounds = scene.bounds
    height = bounds[1][1] - bounds[0][1]
    scale = 2.5 / height
    print(f"Pre-scale height = {height:.3f}, scaling by {scale:.3f}")
    S = np.eye(4)
    S[0, 0] = S[1, 1] = S[2, 2] = scale
    # Center the X/Z and put base at y=0
    T = np.eye(4)
    T[0, 3] = -(bounds[0][0] + bounds[1][0]) / 2 * scale
    T[2, 3] = -(bounds[0][2] + bounds[1][2]) / 2 * scale
    T[1, 3] = -bounds[0][1] * scale
    # Apply combined transform to every geometry (simpler than tweaking nodes)
    final = trimesh.Scene()
    for name, geom in scene.geometry.items():
        g = geom.copy()
        g.apply_transform(T @ S)
        final.add_geometry(g, node_name=name, geom_name=name)

    print("Exporting GLB...")
    glb_bytes = final.export(file_type="glb")
    with open(OUT_PATH, "wb") as f:
        f.write(glb_bytes)
    size_mb = len(glb_bytes) / 1024 / 1024
    print(f"Wrote {OUT_PATH}  ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
