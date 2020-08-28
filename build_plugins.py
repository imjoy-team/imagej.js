import os
from shutil import copyfile
from zipfile import ZipFile

plugins_dir = "plugins"
ij_path = "ij.jar"

MANIFEST = '''Manifest-Version: 1.0
Ant-Version: Apache Ant 1.10.1
Created-By: 1.8.0_172-b11 (Oracle Corporation)
'''

CHEERPJ_DIR = os.environ.get("CHEERPJ_DIR")

with open(plugins_dir+'/index.list', 'w') as index: 
    for root, dirs, files in os.walk(plugins_dir, topdown=False):
        for name in files:
            filename = os.path.join(root, name)
            if CHEERPJ_DIR and name.endswith('.class'):
                print('adding '+ filename)
                with ZipFile(filename.replace('.class', '.jar'), 'w') as zip:
                    zip.writestr('META-INF/MANIFEST.MF', MANIFEST)
                    zip.write(filename, arcname=name)
                # escape $ sign
                filename = filename.replace('$', '\$')
                os.system(CHEERPJ_DIR + '/cheerpjfy.py --deps=' +ij_path+ " "+ filename.replace('.class', '.jar'))
                os.system('rm ' + filename.replace('.class', '.jar'))
                os.system('mv ' + filename.replace('.class', '.jar.js') + ' ' + filename.replace('.class', '.js'))
                if os.path.exists(filename.replace('.class', '.jar.js')):
                    index.write(os.path.relpath(filename, plugins_dir) + '\n')
            elif os.path.relpath(filename, plugins_dir).startswith('jars') and name.endswith('.jar'):
                # with ZipFile(jar_file_name, 'w') as zip:
                #     zip.writestr('META-INF/MANIFEST.MF', MANIFEST)
                #     zip.write(filename, arcname=name)
                pass
            elif name.endswith('.jar') and os.path.exists(filename+'.js'):
                index.write(os.path.relpath(filename, plugins_dir))
            else:
                print('skipping '+ filename)
    
