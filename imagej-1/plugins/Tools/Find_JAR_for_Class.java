import ij.*;
import ij.plugin.PlugIn;
import java.util.*;

public class Find_JAR_for_Class implements PlugIn {

	public void run(String arg) {
		printJarName();
	}

void printJarName() {
	String message = getJarName(IJ.getString("Class name:", "ij.ImageJ"));
	if (message != null)
		IJ.log(message);
}

String stripURL(String url) {
	int bang = url.indexOf("!/");
	if (bang > 0)
		url = url.substring(0, bang);
	if (url.startsWith("jar:"))
		url = url.substring(4);
	if (url.startsWith("file:"))
		url = url.substring(5);
	return url;
}

String getJarName(String className) {
	if (className == null || className.equals(""))
		return null;
	className = className.replace('/', '.');
	String message = "The class " + className;
	try {
		Class clazz = IJ.getClassLoader().loadClass(className);
		if (clazz == null)
			throw new ClassNotFoundException();
		String className2;
		if (clazz.getEnclosingClass() != null)
			className2 = clazz.getEnclosingClass().getName();
		else
			className2 = className;
		String path = className2.replace('.', '/') + ".class";
		String url = stripURL(clazz.getResource("/" + path).toString());
		message += " is contained in " + url;
		Enumeration urls = IJ.getClassLoader().getResources(path);
		while (urls.hasMoreElements()) {
			String url2 = stripURL(urls.nextElement().toString());
			if (url != null && !url2.equals(url))
				message += "\nWARNING! " + className + " is also contained in " + url2 + "!";
		}
	} catch (Exception e) {
		message += " was not found in ImageJ's class path";
	}
	return message;
}

}
