import os
import glob

def generate_image_list(folder_path="images", output_file="imageList.js"):
    """
    Generate a JavaScript imageList array from all images in a folder
    
    Args:
        folder_path (str): Path to the images folder (default: "images")
        output_file (str): Output JavaScript file name (default: "imageList.js")
    """
    
    # Supported image extensions
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.webp']
    
    # Get all image files
    image_files = []
    for extension in image_extensions:
        pattern = os.path.join(folder_path, extension)
        image_files.extend(glob.glob(pattern))
        # Also check uppercase extensions
        pattern_upper = os.path.join(folder_path, extension.upper())
        image_files.extend(glob.glob(pattern_upper))
    
    # Remove duplicates and sort
    image_files = sorted(list(set(image_files)))
    
    # Convert to relative paths with forward slashes (web-friendly)
    relative_paths = []
    for file_path in image_files:
        # Convert to forward slashes for web compatibility
        relative_path = file_path.replace(os.sep, '/')
        relative_paths.append(relative_path)
    
    print(f"Found {len(relative_paths)} image files")
    
    # Generate JavaScript array
    js_content = "// Auto-generated imageList\n"
    js_content += "const imageList = [\n"
    
    for i, path in enumerate(relative_paths):
        # Add comma except for last item
        comma = "," if i < len(relative_paths) - 1 else ""
        js_content += f'    "{path}"{comma}\n'
    
    js_content += "];\n"
    
    # Write to file
    with open(output_file, 'w') as f:
        f.write(js_content)
    
    # Also print to console for easy copy-paste
    print(f"\nGenerated {output_file} with {len(relative_paths)} images")
    print("\n" + "="*50)
    print("JavaScript array (copy this to your experiment file):")
    print("="*50)
    print(js_content)
    
    return relative_paths

def print_just_array(folder_path="images"):
    """
    Just print the array part for easy copy-paste into existing code
    """
    # Get image files (same logic as above)
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.webp']
    image_files = []
    for extension in image_extensions:
        pattern = os.path.join(folder_path, extension)
        image_files.extend(glob.glob(pattern))
        pattern_upper = os.path.join(folder_path, extension.upper())
        image_files.extend(glob.glob(pattern_upper))
    
    image_files = sorted(list(set(image_files)))
    relative_paths = [file_path.replace(os.sep, '/') for file_path in image_files]
    
    print(f"Found {len(relative_paths)} images")
    print("\nCopy this array:")
    print("[")
    for i, path in enumerate(relative_paths):
        comma = "," if i < len(relative_paths) - 1 else ""
        print(f'    "{path}"{comma}')
    print("]")

if __name__ == "__main__":
    # Option 1: Generate full JavaScript file
    print("Generating imageList from images folder...")
    generate_image_list()
    
    print("\n" + "="*50)
    print("Or if you just want the array to copy-paste:")
    print("="*50)
    
    # Option 2: Just print the array for copy-paste
    print_just_array()
