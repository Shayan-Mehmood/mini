import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import apiService from "../../../utilities/service/api";
import { ArrowLeft, Clipboard, LoaderPinwheel, Plus } from "lucide-react";
import { marked } from "marked";
import toast from "react-hot-toast";
import BackButton from "../../../components/ui/BackButton";

const EmailCampaign = () => {
  const { id, contentType } = useParams();
  const [legacyEmails, setLegacyEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState<any>();
  const [loading, setLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  useEffect(() => {
    
    getEmailCampgains();
  }, []);

  const convertLegacyEmailCampaigns = async () => {
    setLoading(true); // Start loading
    try {
      const emailCampaignUrl = `https://minilessonsacademy.com/wf-content/emails/${id}/generated-emails.json`;
      const response = await apiService.post(
        "campaign/convert-email-campaigns",
        { emailCampaignUrl: emailCampaignUrl }
      );
      const legacyEmailsArray: any = Object.values(JSON.parse(response.data));
      setLegacyEmails(legacyEmailsArray);
      setSelectedEmail(legacyEmailsArray[0]);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const getEmailCampgains = async () => {
    try {
      const response: any = await apiService.get(
        `campaign/get-email-campaigns/${id}`
      );
      const parsedEmails = JSON.parse(response.data);
      const parsedParsedEmails = JSON.parse(parsedEmails);
      const arrayedEmails: any = Object.values(parsedParsedEmails);
      setLegacyEmails(arrayedEmails);
      if(arrayedEmails.length === 0){
        convertLegacyEmailCampaigns();
      }
      setSelectedEmail(arrayedEmails[0])
    } catch (error) {
      
    }
  };

  const onEmailClick = (email: any) => {
    setSelectedEmail(email);
  };

  const renderCurrentEmail = () => {
    if (selectedEmail && Object.keys(selectedEmail).length) {
      let refinedHtmlGoal, refinedHtmlSubject, refinedHtmlBody;
      refinedHtmlGoal = selectedEmail.goal.replace(/^```html\s*|\s*```$/g, "");

      refinedHtmlSubject = selectedEmail.subject.replace(
        /^```html\s*|\s*```$/g,
        ""
      );

      refinedHtmlBody = selectedEmail.body.replace(/^```html\s*|\s*```$/g, "");

      const markedBody = marked.parse(refinedHtmlBody);
      const markedGoal = marked.parse(refinedHtmlGoal);
      const markedSubject = marked.parse(refinedHtmlSubject);

      return (
        <div className="flex flex-col gap-4">
          <div className="border-primary bg-slate-200 rounded-lg text-black py-6 px-4 ">
            <div className="flex justify-between">
              <h2 className="font-semibold text-xl mb-2">Goal</h2>
              <button
                className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700  rounded-lg text-xs items-center gap-2 transition-all duration-200 hover:to-purple-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)] cursor-pointer"
                onClick={() =>
                  copyToClipboard(markedGoal)
                }
              >
                <Clipboard className="md:h-6 md:w-6 h-4 w-4" />
              </button>
            </div>
            {markedGoal && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: markedGoal }}
              />
            )}
          </div>
          <div className="border-primary bg-slate-200 rounded-lg text-black py-6 px-4 ">
            <div className="flex justify-between">
              <h2 className="font-semibold text-xl mb-2">Subject</h2>
              <button
                className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700  rounded-lg  text-sm flex items-center gap-2 transition-all duration-200 hover:to-purple-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)] cursor-pointer"
                onClick={() =>
                  copyToClipboard(markedSubject)
                }
              >
                <Clipboard className="md:h-6 md:w-6 h-4 w-4" />
              </button>
            </div>
            {markedSubject && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: markedSubject }}
              />
            )}
          </div>
          <div className="border-primary bg-slate-200 rounded-lg text-black py-6 px-4 ">
            <div className="flex justify-between">
              <h2 className="font-semibold text-xl mb-2">Body</h2>
              <button
                className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700  rounded-lg textx items-center gap-2 transition-all duration-200 hover:to-purple-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)] cursor-pointer"
                onClick={() =>
                  copyToClipboard(markedBody)
                }
              >
                <Clipboard className="md:h-6 md:w-6 h-4 w-4"  />
              </button>
            </div>
            {markedBody && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: markedBody }}
              />
            )}
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const renderEmailButtons = () => {
    if (legacyEmails.length) {
      return (
        <div className="flex gap-2 flex-wrap justify-between my-8">
          {legacyEmails.map((email: any, index: any) => {
            return (
              <div
                className={`${
                  JSON.stringify(selectedEmail) === JSON.stringify(email)
                    ? "bg-purple-400"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700"
                } md:px-5 px-2.5 py-2.5  rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200  hover:to-purple-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)] cursor-pointer mb-6`}
                key={index}
                onClick={() => onEmailClick(email)}
              >
                Email {index + 1}
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="flex gap-2 flex-wrap justify-center items-center min-h-[450px] text-xl text-slate-400">
          <span className="p-16 border border-white rounded-lg shadow-xl">
            No Campaigns To Show
          </span>
        </div>
      );
    }
  };

  const createNewCampaign = async () => {
    setLoading(true); // Start loading
    try {
      const response = await apiService.post(
        `campaign/create-email-campaigns/${id}`,
        {}
      );
      console.log(response, " Response ");
      const newEmails = JSON.parse(response.data);
      console.log(newEmails, " << ");
      const parsedEmails = JSON.parse(newEmails);
      console.log(parsedEmails, " << ");
      const arrayOfEmails: any = Object.values(parsedEmails);
      console.log(arrayOfEmails, "<<<< array of emails");
      setLegacyEmails(arrayOfEmails);
      setSelectedEmail(arrayOfEmails[0])
    } catch (error) {
      console.error("Error creating new campaign:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const copyToClipboard = async (text:any) => {
  try {
    const onlyText = text.replace(/<[^>]*>/g, '')
    await window.navigator.clipboard.writeText(onlyText);
    toast.success('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy!', err);
  }
};


  const Loader = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="relative">
          <LoaderPinwheel className="w-12 h-12 text-primary/20 animate-pulse" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-700">
          Loading Email Campaigns
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Please wait while we process your campaigns
        </p>
        <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary/80 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center p-5 flex-col ">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex justify-between items-center pt-24">
              <BackButton
              onBeforeNavigate={() => true}
              label="Go Back"
              className="text-white"
              href=""
            />
            <h2 className="text-2xl text-primary md:flex hidden">
              Manage Your Course's Email Marketing Campaign
            </h2>

            <button
              className="md:px-5 px-2.5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700  rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 hover:to-purple-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)] cursor-pointer"
              onClick={createNewCampaign}
            >
              <Plus />
              New Campaign
            </button>
          </div>
          <h2 className="text-2xl text-primary md:hidden flex py-6">
            Manage Your Course's Email Marketing Campaign
          </h2>
          {/* <div className=" bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 text-white p-6 rounded-xl my-8">
            Schedule Your Campaigns in Seconds with Mini Lessons Academy! Copy
            and paste into ActiveCampaign, Klaviyo, or your favorite email tool
            to start driving results today.
          </div> */}
          {renderEmailButtons()}
          {renderCurrentEmail()}
        </>
      )}
    </div>
  );
};

export default EmailCampaign;
