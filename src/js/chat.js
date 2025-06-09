window.watsonAssistantChatOptions = {
	integrationID: "521af7ef-3a29-4fac-b88f-07a4737c6782", // The ID of this integration.
	region: "au-syd", // The region your integration is hosted in.
	serviceInstanceID: "71e6ffbd-d63c-44eb-83e7-14d778c66546", // The ID of your service instance.
	onLoad: async (instance) => { await instance.render(); }
};
setTimeout(function(){
	const t=document.createElement('script');
	t.src="https://web-chat.global.assistant.watson.appdomain.cloud/versions/" + (window.watsonAssistantChatOptions.clientVersion || 'latest') + "/WatsonAssistantChatEntry.js";
	document.head.appendChild(t);
});