import {
  Heading,
  Text,
  Box,
  Flex,
  Button,
  Textarea,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { SSE } from "sse";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function App() {
  let [prompt, setPrompt] = useState("");
  let [response, setResponse] = useState("");
  let [isLoading, setIsLoading] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const responseRef = useRef(response);
  const toast = useToast();

  useEffect(() => {
    responseRef.current = response;
  }, [response]);

  let handleClearBtnClicked = () => {
    setPrompt("");
    setResponse("");
  };

  let handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  let handleSubmitBtnClicked = async () => {
    if (prompt === "") {
      toast({
        title: "Prompt is empty",
        description: "Please enter a prompt",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } else {
      setIsLoading(true);
      let url = "https://api.openai.com/v1/completions";
      let data = {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.9,
        top_p: 1,
        n: 1,
        stream: true,
      };

      let source = new SSE(url, {
        headers: {
          "Content-Type": "application/json",
          "OpenAI-Organization": "org-UgDlW6gbY03G8HIgMcAXFPFI",
          Authorization: `Bearer ${API_KEY}`,
        },
        method: "POST",
        payload: JSON.stringify(data),
      });

      source.addEventListener("message", (e) => {
        console.log("Message: ", e.data);
        if (e.data != "[DONE]") {
          let payload = JSON.parse(e.data);
          let text = payload.choices[0].text;
          if (text != "\n") {
            console.log("Text: ", text);
            responseRef.current += text;
            setResponse(responseRef.current);
          } else {
            source.close();
          }
        }
      });

      source.addEventListener("readystatechange", (e) => {
        if (e.readyState >= 2) {
          setIsLoading(false);
          console.log(source.status);
          if (source.status === undefined) {
            toast({
              title: "API Key is not set",
              description: "Please check your API key and try again.",
              status: "error",
              duration: 2000,
              isClosable: true,
            });
          }
        }
      });
      source.stream();
    }
  };

  return (
    <Flex
      width={"100vw"}
      height={"100vh"}
      alignContent={"center"}
      justifyContent={"center"}
      bg={"#062940"}
      bgGradient={
        "linear-gradient(#052a42,rgba(5,41,65,.8)),url(https://assets-global.website-files.com/61bcbae3ae2e8ee49aa790b0/6356aeef79abe85bcdbd3d68_grid-block.svg)"
      }
    >
      <Box
        boxShadow="dark-lg"
        maxW="2xl"
        m="auto"
        bg={colorMode === "dark" ? "#062940" : "white"}
        p="20px"
        borderRadius={"md"}
      >
        <Heading mb={4}>
          <span onClick={toggleColorMode} style={{ cursor: "pointer" }}>
            {colorMode === "light" ? "🌝 " : "🌚 "}
          </span>
          🤖 OpenAI Completions{" "}
        </Heading>
        <Text mb={4}>
          This is an example of using SSE (Server-Sent Events) with React, Vite.
        </Text>
        <Textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder={"Give me any sentence to complete.."}
        />
        <Button
          mt={4}
          isLoading={isLoading}
          loadingText="Fetching Data.."
          onClick={handleSubmitBtnClicked}
          colorScheme={"blue"}
        >
          Ask
        </Button>
        <Button mt={4} mx={4} onClick={handleClearBtnClicked}>
          Clear
        </Button>

        {response === "" ? null : (
          <Box mt={4}>
            <Heading fontSize={"md"}>Response</Heading>
            <Text mt={2}>{response}</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

export default App;
