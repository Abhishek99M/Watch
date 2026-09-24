# V11 retrieval-grounded design notes

Retrieved 24 September 2026. The workflow combines retrieved primary references with the existing generator, renderer source, and watch brief; findings are mapped below to concrete changes.

1. Grand Seiko: hairline finishing and polished surfaces work together. Application: preserve restrained brushed tops, give lug flanks a clean polished finish, retain narrow edge transitions. We are not claiming an actual Zaratsu manufacturing process.
https://www.grand-seiko.com/au-en/special/dream9stories/vol9/2

2. Khronos anisotropy extension: explicit normals and tangents are recommended for anisotropic meshes. Application: generate MikkTSpace tangents for all anisotropic base meshes, then preserve them through the bake/export. Directional metal response no longer relies solely on runtime tangent derivation.
https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_anisotropy/README.md

3. Khronos volume extension: thickness is in mesh coordinates and follows node transforms. Local geometry is in millimeters beneath a 0.001 root scale; correct 0.00065 to 0.65 local units, corresponding to approximately 0.65 mm at world scale. This fixes a scale error, not a measured sapphire model.
https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_volume/README.md

4. Three.js renderer documentation plus installed source: transmission has its own target resolution, default 1.0. It was already full viewport resolution, not half resolution. Application: moderately supersample both viewport and transmission for this inspection viewer. Physical device performance remains unmeasured.
https://threejs.org/docs/pages/WebGLRenderer.html

5. Local findings: dial branding was rasterized at small size into a texture. Replace it with original vector-outline extruded geometry and remove all old texture text. Beauty camera used depth of field; disable it for fully focused inspection. No artificial sharpening filter or generated-image replacement is used.

Visual ratings remain subjective and are not inferred from technical checks.
