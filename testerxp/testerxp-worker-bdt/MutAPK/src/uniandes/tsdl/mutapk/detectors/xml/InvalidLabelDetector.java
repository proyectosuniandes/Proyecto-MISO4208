package uniandes.tsdl.mutapk.detectors.xml;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import uniandes.tsdl.mutapk.detectors.TextBasedDetector;
import uniandes.tsdl.mutapk.helper.Helper;
import uniandes.tsdl.mutapk.model.MutationType;
import uniandes.tsdl.mutapk.model.location.MutationLocation;

public class InvalidLabelDetector extends TextBasedDetector {

	public InvalidLabelDetector() {
		this.type = MutationType.INVALID_LABEL;
	}

	@Override
	public List<MutationLocation> analyzeApp(String rootPath) throws Exception {
		List<MutationLocation> locations = new ArrayList<MutationLocation>();
		List<String> activityLabels = new ArrayList<String>();


		String path = rootPath + File.separator + Helper.MANIFEST;

		File fXmlFile = new File(path);
		DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
		Document doc = dBuilder.parse(fXmlFile);
		doc.getDocumentElement().normalize();

		// Get all activities
		NodeList nodeList = doc.getElementsByTagName("activity");
		for (int i = 0; i < nodeList.getLength(); i++) {
			Node node = nodeList.item(i);
			NamedNodeMap attrMap = node.getAttributes();
			// Loop through attributes
			for (int j = 0; j < attrMap.getLength(); j++) {
				if (attrMap.item(j).getNodeName().equals("android:label")) {
					// Get all activity names
					activityLabels.add(attrMap.item(j).getNodeValue());
				}
			}
		}

		// Read Source Code
		BufferedReader reader = new BufferedReader(new FileReader(
				new File(path)));
		String line = null;
		int startLine = 0;
		int startCol = 0;
		int endCol = 0;
		int lineNum = 0; 
		boolean isActivityTag = false;
		int currentLine = 0;
		boolean labelFound = false;
		while ((line = reader.readLine()) != null) {

			if (line.contains("<activity")) {
				startLine = currentLine;
				isActivityTag = true;
			}
			if (isActivityTag) {
				for(String label : activityLabels){
					if(line.contains("android:label") && line.contains(label)){
						startCol = line.indexOf("\""+label)+1;
						endCol = startCol+label.length();
						lineNum = currentLine;
						labelFound = true;
					}
				}
				if (line.contains(">")) {
					if(labelFound){
						locations.add(MutationLocation.buildLocation(path, startLine, currentLine, startCol, endCol, lineNum, -1, this.getType()));
						labelFound = false;
					}
					isActivityTag = false;
				}
			}
			currentLine++;
		}
		reader.close();
		return locations;
	}
}
