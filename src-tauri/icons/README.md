https://github.com/qwertzalcoatl/macos-icon-generator
```sh
> nix-shell -p python313 python313Packages.pycairo python313Packages.pillow
> python macos_icon_generator.py cca.png -o ./app_icons
> cp app_icons/icon_1024x1024.png ../../app-icon.png
```

https://v2.tauri.app/develop/icons/
```sh
> pnpm run tauri icon
```